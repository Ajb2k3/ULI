import * as Blockly from 'blockly';
import { pythonGenerator } from 'blockly/python';
import 'blockly/blocks';
import 'blockly/python'; 
import { toolbox } from './toolbox.js';
import { initSerialization } from './serialization.js';
import './index.css';

// --- 1. Setup Variables ---
let port;
let globalWriter;
const encoder = new TextEncoder();

const interfaceTheme = Blockly.Theme.defineTheme('interfaceTheme', {
  'base': Blockly.Themes.Classic,
  'categoryStyles': {
    'logic_category': { 'colour': '210' },
    'loop_category': { 'colour': '120' },
    'math_category': { 'colour': '230' },
    'text_category': { 'colour': '160' },
    'list_category': { 'colour': '260' },
    'variable_category': { 'colour': '330' },
    'procedure_category': { 'colour': '290' },
    'interface_category': { 'colour': '160' }
  },
  'startHats': true,
});

// --- 2. Inject Workspace ---
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
  theme: interfaceTheme, // Added your theme here
  grid: { spacing: 25, length: 3, colour: '#ccc', snap: true },
  move: { scrollbars: true, drag: true, wheel: true },
  zoom: { controls: true, wheel: true, startScale: 1.0 },
  trashcan: true,
});

initSerialization();

// --- 3. Block Definitions ---
Blockly.defineBlocksWithJsonArray([
  {
    "type": "interface_b_init",
    "message0": "Initialise Interface B",
    "nextStatement": null,
    "colour": 20,
    "style": { "hat": "cap" }
  },  
  {
    "type": "add_text",
    "message0": "Add Note %1",
    "args0": [{ "type": "input_value", "name": "TEXT", "check": "String" }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160
  },
  {
    "type": "Wake_up",
    "message0": "Wake Up Interface B",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160
  },
  {
  "type": "interface_b_output",
  "message0": "Motor %1 Power %2 Dir %3",
  "args0": [
    { 
      "type": "field_dropdown", 
      "name": "OUT", 
      "options": [
        ["A", "0x01"], 
        ["B", "0x02"], 
        ["C", "0x04"], 
        ["D", "0x08"]
      ] 
    },
    { "type": "input_value", "name": "POWER", "check": "Number" },
    { 
      "type": "field_dropdown", 
      "name": "DIR", 
      "options": [
        ["Forward", "1"], 
        ["Backward", "2"], 
        ["Off", "0"]
      ] 
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 0
  },
  {
    "type": "interface_b_stop_all",
    "message0": "STOP ALL MOTORS",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 0
  },
  {
    "type": "interface_b_input",
    "message0": "Sensor on Port %1",
    "args0": [
      { "type": "field_dropdown", "name": "PORT", "options": [["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]] }
    ],
    "output": "Number",
    "colour": 210
  },
  {
    "type": "wait_seconds",
    "message0": "wait %1 seconds",
    "args0": [{ "type": "field_number", "name": "SECONDS", "value": 1, "min": 0 }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120
  },
  {
    "type": "interface_b_forever",
    "message0": "repeat forever %1 %2",
    "args0": [{ "type": "input_dummy" }, { "type": "input_statement", "name": "DO" }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120
  }
]);

// --- 4. Serial Communication Functions ---

async function readFromSerial() {
  const textDecoder = new TextDecoder();
  const reader = port.readable.getReader();
  try {
    while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  
  // Filter out null bytes (0) and junk before decoding
  const cleanValue = value.filter(byte => byte !== 0 && byte < 128);
  
  if (cleanValue.length > 0) {
    const text = textDecoder.decode(cleanValue);
    const outputDiv = document.getElementById('terminal-output');
    outputDiv.innerText += text;
    // ... scroll logic ...
  }
}
  } catch (err) {
    console.error("Read error:", err);
  } finally {
    reader.releaseLock();
  }
}

window.scanPorts = async () => {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 });
    globalWriter = port.writable.getWriter(); 
    document.getElementById('terminal-output').innerText = "--- Connected to Interface B ---\n";
    readFromSerial(); 
  } catch (e) {
    console.error("Connection failed", e);
  }
};

  const runCode = async () => {
  // 1. Convert blocks to our "Marker" strings
  const code = pythonGenerator.workspaceToCode(workspace);
  
  if (!globalWriter) {
    alert("Please connect to the device first!");
    return;
  }

  // 2. Split the generated code into individual lines
  const lines = code.split('\n');

  try {
    // 3. Loop through each line and send the specific bytes
    for (let line of lines) {
      if (line.includes("[[RAW_HANDSHAKE]]")) {
        const handshake = new Uint8Array([112, 0, 35, 35, 35, 68, 111, 32, 121, 111, 117, 32, 98, 121, 116, 101, 44, 32, 119, 104, 101, 110, 32, 73, 32, 107, 110, 111, 99, 107, 63, 36, 36, 36]);
        await globalWriter.write(handshake);
        console.log("Handshake sent.");
      } 
      else if (line.startsWith("[[MOTOR]]")) {
        const parts = line.split(':');
        const portByte = parseInt(parts[1], 16); 
        const cmdByte = parseInt(parts[2], 16);

        const motorPacket = new Uint8Array([portByte, cmdByte]);
        await globalWriter.write(motorPacket);
        
        console.log(`Sent Motor Command: Port ${parts[1]}, Cmd ${parts[2]}`);
      }
      // Optional: Handle regular text commands if you have any
      else if (line.trim() !== "") {
        await globalWriter.write(encoder.encode(line + "\r\n"));
      }
    }
    
    document.getElementById('terminal-output').innerText += `\n>>> Run sequence complete.\n`;
  } catch (err) {
    console.error("Failed to send data:", err);
  }
};

// --- 5. Event Listeners ---

document.getElementById('btnScan').addEventListener('click', window.scanPorts);
document.getElementById('btnRun').addEventListener('click', runCode);

// Function for real-time preview
function updatePython() {
  const code = pythonGenerator.workspaceToCode(workspace);
  const output = document.getElementById('pythonOutput');
  if (output) {
    output.innerText = code || "# Drag blocks to see code...";
  }
}

workspace.addChangeListener(updatePython);

window.addEventListener('resize', () => Blockly.svgResize(workspace));
window.addEventListener('load', updatePython);