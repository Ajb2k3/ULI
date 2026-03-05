// 1. Initialize the Generator Pointer
const py = python.pythonGenerator;

// 2. The ONLY getPort function you need
// It checks the sidebar UI first, then falls back to a default
function getPort(interfaceName) {
    let port = "";
    // Check the DOM for the interface rows
    document.querySelectorAll('.interface-row').forEach(row => {
        const nameInput = row.querySelector('.iface-name');
        const portSelect = row.querySelector('.iface-port');
        if (nameInput && nameInput.value === interfaceName) {
            port = portSelect.value;
        }
    });
    
    // If not found in rows, check if window.getInterfaceMapping exists
    if (!port && typeof window.getInterfaceMapping === 'function') {
        const map = window.getInterfaceMapping();
        port = map[interfaceName];
    }

    return port || ""; // Return empty string if not found
}

// --- Interface B Logic ---


python.pythonGenerator.forBlock['interface_b_init'] = (block) => {
    const name = block.getFieldValue('NAME');
    const port = getPort(name);

    return `
import serial, time, sys
if 'ifaces' not in globals(): globals()['ifaces'] = {}

# Force release if it exists
if '${name}' in ifaces and ifaces['${name}']:
    try: ifaces['${name}']['ser'].close()
    except: pass

try:
    # Try to connect. If it fails (port busy), wait a moment and try one more time.
    try:
        ifaces['${name}'] = {'ser': serial.Serial('${port}', 9600, timeout=0), 'seq': 0x00}
    except serial.SerialException:
        time.sleep(0.5)
        ifaces['${name}'] = {'ser': serial.Serial('${port}', 9600, timeout=0), 'seq': 0x00}
        
    ifaces['${name}']['ser'].write(b'p\\0###Do you byte, when I knock?$$$')
    time.sleep(0.2)
    print("INTERFACE READY")
except Exception as e:
    print(f"HARDWARE ERROR: {e}")
    ifaces['${name}'] = None
\n`;
};

python.pythonGenerator.forBlock['additional_interface_b_init'] = (block) => {
    const name = block.getFieldValue('NAME');
    const port = getPort(name); 

    return `
import serial, time, sys
if 'ifaces' not in globals(): globals()['ifaces'] = {}

# Force release if it exists
if '${name}' in ifaces and ifaces['${name}']:
    try: ifaces['${name}']['ser'].close()
    except: pass

try:
    # Try to connect. If it fails (port busy), wait a moment and try one more time.
    try:
        ifaces['${name}'] = {'ser': serial.Serial('${port}', 9600, timeout=0), 'seq': 0x00}
    except serial.SerialException:
        time.sleep(0.5)
        ifaces['${name}'] = {'ser': serial.Serial('${port}', 9600, timeout=0), 'seq': 0x00}
        
    ifaces['${name}']['ser'].write(b'p\\0###Do you byte, when I knock?$$$')
    time.sleep(0.2)
    print("INTERFACE READY")
except Exception as e:
    print(f"HARDWARE ERROR: {e}")
    ifaces['${name}'] = None
\n`;
};

python.pythonGenerator.forBlock['interface_b_output'] = (block) => {
    const name = block.getFieldValue('NAME');
    const motorHex = block.getFieldValue('OUT'); // e.g., "0x01"
    const dirHex = block.getFieldValue('DIR');   // e.g., "0x91"

    return `if '${name}' in ifaces:
    # Interface B Motor Command: MotorBit + DirByte
    # Using your dropdown hex values:
    pkt = bytearray([${dirHex},${motorHex},])
    ifaces['${name}']['ser'].write(pkt)
    ifaces['${name}']['ser'].flush()
\n`;
};
python.pythonGenerator.forBlock['interface_b_read_19'] = (block) => {
    const name = block.getFieldValue('NAME');
    // 1. We send the keepalive (\x02)
    // 2. We wait 100ms (to let the 19 bytes arrive at 9600 baud)
    // 3. We only read if there is data, otherwise we return a "Safe" blank packet
    const code = `ifaces['${name}']['ser'].read(19)`;
    return [code, 0];
};

python.pythonGenerator.forBlock['interface_b_read'] = (block) => {
    const name = block.getFieldValue('NAME');
    // Just like your working script: Direct read of 31 bytes
    const code = `ifaces['${name}']['ser'].read(31) if '${name}' in ifaces else b'NO_CONN'`;
    return [code, 0];
};

python.pythonGenerator.forBlock['iface_b_touch'] = (block, generator) => {
    // Get the variable or block connected to the 'DATA' socket
    const dataCode = generator.valueToCode(block, 'DATA', 0) || "b'\\x00'*19";
    const portOffset = block.getFieldValue('PORT'); // e.g., "14"

    // Logic: Look at the packet, find the 2-byte value at the port offset,
    // and see if it's less than 500 (typical threshold for a pressed sensor)
    const code = `(int.from_bytes(bytes(${dataCode})[${portOffset}:${parseInt(portOffset)+2}], 'big') < 500)`;
    return [code, 0];
};

python.pythonGenerator.forBlock['wait_seconds'] = (block) => {
    const seconds = block.getFieldValue('SEC') || 0.1;
    return `time.sleep(${seconds})\n`;
};
// Generator for Yellow Passive Ports
python.pythonGenerator.forBlock['iface_b_passive'] = (block, generator) => {
    const name = block.getFieldValue('NAME');
    const dataCode = generator.valueToCode(block, 'DATA', 0) || "b'\\x00'*19";
    const offset = block.getFieldValue('PORT'); 
    
    // Check length (len) before converting (int.from_bytes)
    const code = `(int.from_bytes(${dataCode}[${offset}:${parseInt(offset)+2}], 'big') if len(${dataCode}) >= 19 else 0)`;
    return [code, 0];
};

// Generator for Blue Active Ports
python.pythonGenerator.forBlock['iface_b_active'] = (block, generator) => {
    const dataCode = generator.valueToCode(block, 'DATA', 0) || "b'\\x00'*19";
    const offset = block.getFieldValue('PORT'); 
    const code = `int.from_bytes(bytes(${dataCode})[${offset}:${parseInt(offset)+2}], 'big')`;
    return [code, 0]; // Must be a tuple!
};

// --- RCX Logic ---

// --- RCX Initialization Logic ---

python.pythonGenerator.forBlock['rcx_init'] = (block) => {
    const name = block.getFieldValue('NAME');
    // Fetch the port from the sidebar UI mapping
    const port = getPort(name);

    if (!port) {
        return `print("ERROR: No port assigned to RCX ${name} in the sidebar!")\n`;
    }

    return `
# --- Uses Bliss RCX Lib via Dynamic Port ---
from legorcx import RCX
import time, sys

try:
    rcx = RCX("${port}")
    print("RCX ${name} INITIALIZED ON ${port}")
except Exception as e:
    print(f"RCX CONNECTION ERROR: {e}")
\n`;
};

python.pythonGenerator.forBlock['additional_rcx_init'] = (block) => {
     const name = block.getFieldValue('NAME');
    // Fetch the port from the sidebar UI mapping
    const port = getPort(name);

    if (!port) {
        return `print("ERROR: No port assigned to RCX ${name} in the sidebar!")\n`;
    }

    return `
# --- Uses Bliss RCX Lib via Dynamic Port ---
from legorcx import RCX
import time, sys

try:
    rcx = RCX("${port}")
    print("RCX ${name} INITIALIZED ON ${port}")
except Exception as e:
    print(f"RCX CONNECTION ERROR: {e}")
\n`;
};


python.pythonGenerator.forBlock['rcx_beep'] = (block) => {
    
    const rcxsound = block.getFieldValue('rsnd')
//    const code = `rcx.snd(1)\n`; 
    return `rcx.snd(${rcxsound})\n`;
};
python.pythonGenerator.forBlock['rcx_close'] = (block) => {
    const code = `rcx.close()\n`; 
    return code;
};
python.pythonGenerator.forBlock['rcx_motor_out'] = (block) => {
    const rcxmp = block.getFieldValue('MPORT'); // e.g., "rcx.A"
    return `rcx.mot(${rcxmp})\n`;
};





// -------------------------------- Other Stuff I have forgotten --------------------------------
python.pythonGenerator.forBlock['wait_seconds'] = (block) => {
    const seconds = block.getFieldValue('SEC') || 0.1;
    // We split the sleep into 100ms chunks so we can check the kill-switch frequently
    return `
for _ in range(int(${seconds} * 10)):
    if not getattr(sys.modules["__main__"].window.backend, "running", True): break
    time.sleep(0.1)
\n`;
};

// Override the while loop to check the backend status
python.pythonGenerator.forBlock['controls_whileUntil'] = function(block, generator) {
  const until = block.getFieldValue('MODE') === 'UNTIL';
  const condition = generator.valueToCode(block, 'BOOL', python.Order.NONE) || 'False';
  let branch = generator.statementToCode(block, 'DO');
  
  // This is the "Heartbeat" check. If the backend is stopped, the loop breaks instantly.
  const checkRunning = '  if not getattr(sys.modules["__main__"].window.backend, "running", True):break\n';
  
  return 'while ' + (until ? 'not ' : '') + condition + ':\n' + checkRunning + branch;
};

// Safe Wait: Checks the 'running' flag every 100ms
python.pythonGenerator.forBlock['wait_seconds'] = (block) => {
    const seconds = block.getFieldValue('SEC') || 0.1;
    return `
for _ in range(int(${seconds} * 10)):
    if not getattr(sys.modules["__main__"].window.backend, "running", True): break
    time.sleep(0.1)
\n`;
};

// Safe Loop: Checks the 'running' flag every iteration
python.pythonGenerator.forBlock['controls_whileUntil'] = function(block, generator) {
  const until = block.getFieldValue('MODE') === 'UNTIL';
  const condition = generator.valueToCode(block, 'BOOL', python.Order.NONE) || 'False';
  let branch = generator.statementToCode(block, 'DO');
  
  // Python is picky: the line below MUST start with 4 spaces
  const checkRunning = '  if not getattr(sys.modules["__main__"].window.backend, "running", True): break\n';
  
  return 'while ' + (until ? 'not ' : '') + condition + ':\n' + checkRunning + branch;
};
