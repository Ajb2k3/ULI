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

// ----------------------------------------- Interface B Logic -------------------------------------------


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

    if (!port) {
        return `print("ERROR: No port assigned to Interface B ${name} in the sidebar!")\n`;
    }

    // We use the 'name' variable from Blockly as the Python variable name
    return `

import serial, time, sys

try:
    ifaces['${name}'] = {'ser': serial.Serial('${port}', 9600, timeout=1), 'seq': 0x00}
    print(f"Interface B ${name} INITIALIZED ON ${port}")
except Exception as e:
    print(f"INTERFACE B CONNECTION ERROR for ${name}: {e}")
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
//python.pythonGenerator.forBlock['iface_b_stop_button'] = (block, generator) => {
 //   const dataCode = generator.valueToCode(block, 'DATA', 0) || "b'\\x00'*19";
//    const code = `int.from_bytes(bytes(${dataCode})[0:1], 'big')`;
//   return [code, 0];
//};

// Generator for Interface B's Stop Button
python.pythonGenerator.forBlock['iface_b_stop_button'] = (block, generator) => {
    const name = block.getFieldValue('NAME');
    const readCode = `ifaces['${name}']['ser'].read(19)`;
    const code = `int.from_bytes(${readCode}[0:1], 'big')`;
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

// -------------------------------- WEDO 1.0 HUB --------------------------------
python.pythonGenerator.forBlock['wedo_motor_move'] = function(block, generator) {
  // This part adds the header to the TOP of the file, only once
  generator.definitions_['import_wedo_hid'] = 
    'import hid\nimport time\n\ndevice = hid.device()\ndevice.open(0x0694, 0x0003)';

  const port = block.getFieldValue('PORT');
  const power = generator.valueToCode(block, 'POWER', python.pythonGenerator.ORDER_ATOMIC) || '0';
  
  let code = '';
  if (port === 'PORT_A') {
    code = `device.write([0x00, 0x40, int(${power}), 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])\n`;
  } else {
    code = `device.write([0x00, 0x40, 0x00, int(${power}), 0x00, 0x00, 0x00, 0x00, 0x00])\n`;
  }
  return code;
};

python.pythonGenerator.forBlock['wedo_light_sensor'] = function(block, generator) {
  // Ensure the setup code is at the top of the script
  generator.definitions_['import_wedo_hid'] = 
    'import hid\nimport time\n\ndevice = hid.device()\ntry:\n    device.open(0x0694, 0x0003)\nexcept:\n    pass';

  const portIndex = block.getFieldValue('PORT');
  
  // device.read(8) returns a list of bytes. 
  // Index 2 is Port A, Index 3 is Port B.
  const code = `device.read(8)[${portIndex}]`;
  
  return [code, python.pythonGenerator.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['wedo_sensor_led'] = function(block, generator) {
  const port = block.getFieldValue('PORT');
  const state = block.getFieldValue('STATE');
  
  let code = '';
  if (port === 'PORT_A') {
    code = `device.write([0x00, 0x40, ${state}, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])\n`;
  } else {
    code = `device.write([0x00, 0x40, 0x00, ${state}, 0x00, 0x00, 0x00, 0x00, 0x00])\n`;
  }
  return code;
};

python.pythonGenerator.forBlock['wedo_tilt_sensor'] = function(block, generator) {
  generator.definitions_['import_wedo_hid'] = 
    'import hid\nimport time\n\ndevice = hid.device()\ntry:\n    device.open(0x0694, 0x0003)\nexcept:\n    pass';

  const portIndex = block.getFieldValue('PORT');
  
  // Reads the 8-byte report and grabs the specific port byte
  const code = `device.read(8)[${portIndex}]`;
  
  return [code, python.pythonGenerator.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['wedo_tilt_direction'] = function(block, generator) {
  // Add the helper function to the top of the Python script
  generator.definitions_['import_wedo_hid'] = 
    'import hid\nimport time\n\ndevice = hid.device()\ndevice.open(0x0694, 0x0003)';
    
  generator.definitions_['func_get_tilt'] = 
`def get_tilt_direction(port_idx):
    raw = device.read(8)[port_idx]
    if raw < 60: return 1 # Forward
    if raw > 180: return 2 # Backward
    if 70 < raw < 100: return 3 # Left
    if 140 < raw < 170: return 4 # Right
    return 0 # Flat`;

  const portIndex = block.getFieldValue('PORT');
  const code = `get_tilt_direction(${portIndex})`;
  
  return [code, python.pythonGenerator.ORDER_ATOMIC];
};

python.pythonGenerator.forBlock['wedo_dashboard'] = function(block, generator) {
  // Ensure we have the base setup
  generator.definitions_['import_wedo_hid'] = 
    'import hid\nimport time\n\ndevice = hid.device()\ndevice.open(0x0694, 0x0003)';

  // The logic reads the full buffer and prints the specific indexes 
  // where WeDo 1.0 stores Port A and Port B data.
  const code = 
`data = device.read(8)
if data:
    print(f"--- WeDo Hub Status ---")
    print(f"Port A Raw: {data[2]}")
    print(f"Port B Raw: {data[3]}")
    print(f"Full Packet: {list(data)}")
    time.sleep(0.5) # Prevent flooding the console
`;
  return code;
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
