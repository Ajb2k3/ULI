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
        ifaces['${name}'] = {'ser': serial.Serial('${port}', 9600, timeout=1), 'seq': 0x00}
    except serial.SerialException:
        time.sleep(0.5)
        ifaces['${name}'] = {'ser': serial.Serial('${port}', 9600, timeout=1), 'seq': 0x00}
        
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
        ifaces['${name}'] = {'ser': serial.Serial('${port}', 9600)}
    except serial.SerialException:
        time.sleep(0.5)
        ifaces['${name}'] = {'ser': serial.Serial('${port}', 9600)}
        
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
    const code = `ifaces['${name}']['ser'].read(19)`;
    return [code, 0];
};

python.pythonGenerator.forBlock['interface_b_read'] = (block) => {
    const name = block.getFieldValue('NAME');
    // Just like your working script: Direct read of 31 bytes
    const code = `ifaces['${name}']['ser'].read(31) if '${name}' in ifaces else b'NO_CONN'`;
    return [code, 0];
};
python.pythonGenerator.forBlock['keep_alive'] = (block) => {
    const name = block.getFieldValue('NAME');
    // Just like your working script: Direct read of 31 bytes
    return `ifaces['${name}']['ser'].write(b'\\x02')\n`; 
};

python.pythonGenerator.forBlock['iface_b_touch'] = (block, generator) => {
    const dataCode = generator.valueToCode(block, 'DATA', 0) || "b'\\x00'*19";
    const portOffset = block.getFieldValue('PORT');

    // Logic: Simply convert the 2-byte slice into an integer and return it
    const code = `int.from_bytes(bytes(${dataCode})[${portOffset}:${parseInt(portOffset)+2}], 'big')`;
    
    // We return it as ORDER_ATOMIC (0) so it's treated as a single unit
    return [code, 0];
};
// Generator for Interface B's Stop Button
python.pythonGenerator.forBlock['iface_b_stop_button'] = (block, generator) => {
    const dataCode = generator.valueToCode(block, 'DATA', 0) || "b'\\x00'*19";
    const code = `int.from_bytes(bytes(${dataCode})[0:1], 'big')`;
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
    const code = `(int.from_bytes(bytes(${dataCode})[${offset}:${parseInt(offset)+2}], 'big')`;
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
    const port = getPort(name);

    if (!port) {
        return `print("ERROR: No port assigned to RCX ${name} in the sidebar!")\n`;
    }

    // We use the 'name' variable from Blockly as the Python variable name
    return `
# --- Uses Bliss RCX Lib via Dynamic Port ---
from legorcx import RCX
import time, sys

try:
    ${name} = RCX("${port}")
    print(f"RCX ${name} INITIALIZED ON ${port}")
except Exception as e:
    print(f"RCX CONNECTION ERROR for ${name}: {e}")
\n`;
};

python.pythonGenerator.forBlock['additional_rcx_init'] = (block) => {
    const name = block.getFieldValue('NAME');
    const port = getPort(name);

    if (!port) {
        return `print("ERROR: No port assigned to RCX ${name} in the sidebar!")\n`;
    }

    // We use the 'name' variable from Blockly as the Python variable name
    return `
# --- Uses Bliss RCX Lib via Dynamic Port ---
from legorcx import RCX
import time, sys

try:
    ${name} = RCX("${port}")
    print(f"RCX ${name} INITIALIZED ON ${port}")
except Exception as e:
    print(f"RCX CONNECTION ERROR for ${name}: {e}")
\n`;
};


python.pythonGenerator.forBlock['rcx_beep'] = (block) => {
    const name = block.getFieldValue('NAME');
    const rcxsound = block.getFieldValue('rsnd');
    
    // Uses the dynamic variable name defined in the init block
    return `${name}.snd(${rcxsound})\n`;
};
python.pythonGenerator.forBlock['rcx_close'] = (block) => {
    const name = block.getFieldValue('NAME');
    return `${name}.close()\n`; 
};
python.pythonGenerator.forBlock['rcx_motor_out_on'] = (block) => {
    const name = block.getFieldValue('NAME');   // e.g., "rcx_1"
    const rcxmp = block.getFieldValue('MPORT'); // e.g., "A"
    
    // This constructs: rcx_1.mot(rcx_1.A)
    return `${name}.mot(${name}.${rcxmp}).on()\n`;
};
python.pythonGenerator.forBlock['rcx_motor_out_off'] = (block) => {
    const name = block.getFieldValue('NAME');   // e.g., "rcx_1"
    const rcxmp = block.getFieldValue('MPORT'); // e.g., "A"
    
    // This constructs: rcx_1.mot(rcx_1.A)
    return `${name}.mot(${name}.${rcxmp}).off()\n`;
};


// -------------- Py Serial Functions -------------------

python.pythonGenerator.forBlock['clear_input_buffer'] = (block) => {
    const name = block.getFieldValue('NAME');   // e.g., "rcx_1"
    return `ifaces['IFACE_1']['ser'].reset_input_buffer()\n`;
};

python.pythonGenerator.forBlock['clear_output_buffer'] = (block) => {
    const name = block.getFieldValue('NAME');   // e.g., "rcx_1"
    return `ifaces['IFACE_1']['ser'].reset_output_buffer()\n`;
};

// -------------------------------- Other Stuff I have forgotten --------------------------------

// Safe Loop: Checks the 'running' flag every iteration
//python.pythonGenerator.forBlock['controls_whileUntil'] = function(block, generator) {
//  const until = block.getFieldValue('MODE') === 'UNTIL';
//  const condition = generator.valueToCode(block, 'BOOL', python.Order.NONE) || 'False';
//  let branch = generator.statementToCode(block, 'DO');
//  
//  // Python is picky: the line below MUST start with 4 spaces
//  const checkRunning = '  if not getattr(sys.modules["__main__"].window.backend, "running", True): break\n';
//  
//  return 'while ' + (until ? 'not ' : '') + condition + ':\n' + checkRunning + branch;
//};
