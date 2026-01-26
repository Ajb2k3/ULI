import * as Blockly from 'blockly';
import { pythonGenerator } from 'blockly/python';
import 'blockly/blocks';
import 'blockly/python'; 
import { libraryBlocks } from 'blockly/blocks';
import { toolbox } from './toolbox.js';
import { initSerialization } from './serialization.js';
import './index.css';

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
    'interface_category': { 'colour': '160' } // Your custom teal color
  },
  'startHats': true,
});

// Inject Workspace
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
  grid: { spacing: 25, length: 3, colour: '#ccc', snap: true },
  move: { scrollbars: true, drag: true, wheel: true },
  zoom: { controls: true, wheel: true, startScale: 1.0 },
  trashcan: true,
});

// ADD THIS BOX TO FORCE RESIZE:
window.addEventListener('resize', () => {
  Blockly.svgResize(workspace);
}, false);

// Update Python preview in real-time
workspace.addChangeListener(() => {
  const code = pythonGenerator.workspaceToCode(workspace);
  const output = document.getElementById('pythonOutput');
  if (output) {
    output.innerText = code;
  }
});

// Port Scanning Logic (for Safari/Mac compatibility)
let port;
let writer;

window.scanPorts = async () => {
if (navigator.serial) {  
 try {
    // 1. Request the port (Browser will show a popup)
    port = await navigator.serial.requestPort();
    
    // 2. Open the port
    await port.open({ baudRate: 9600 }); // Interface B usually likes 9600
    
    // 3. Set up a writer to send data
    const encoder = new TextEncoder();
    const writableStream = port.writable;
    writer = writableStream.getWriter();

    alert("Interface B Connected!");
    document.getElementById('btnScan').innerText = "Connected ✅";
 } catch (e) {
      console.log("User cancelled port selection");
    }
  } else {
    alert("Web Serial is blocked. Are you using http://localhost?");
  }
};


// Function to update the side panel
function updateCodePreview() {
  // Generate the Python code using the pythonGenerator
  const code = pythonGenerator.workspaceToCode(workspace);
  
  // Find the sidebar element
  const outputElement = document.getElementById('pythonOutput');
  
  if (outputElement) {
    // If the workspace is empty, show a placeholder
    outputElement.innerText = code || "# Drag blocks to see code...";
  }
}

// Attach the listener to the workspace
workspace.addChangeListener(updateCodePreview);

// Run it once on load so it's not empty
updateCodePreview();

// --- 1. Block Definitions ---
Blockly.defineBlocksWithJsonArray([
{
  "type": "interface_b_init",
  "message0": "Initialise Interface B",
  "nextStatement": null, // No 'previous' because it's a starter block
  "colour": 20,
  "style": {
    "hat": "cap" // This creates the "Hat" shape
  },
  "tooltip": "Connects to the Serial port and wakes up the hardware.",
  "helpUrl": ""
},  
{
    "type": "add_text",
    "message0": "Add Note %1",
    "args0": [{
      "type": "input_value",  // Changed to input_value for "connections"
      "name": "TEXT",
      "check": "String"
    }],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160
  }, // <--- COMMA HERE
  {
    "type": "Wake_up",
    "message0": "Wake Up Interface B",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
  }, // <--- COMMA HERE
  {
    "type": "interface_b_output",
    "message0": "Motor %1 Power %2 Dir %3",
    "args0": [
      { "type": "field_dropdown", "name": "OUT", "options": [["A", "0"], ["B", "1"], ["C", "2"], ["D", "3"]] },
      { "type": "input_value", "name": "POWER", "check": "Number" },
      { "type": "field_dropdown", "name": "DIR", "options": [["Forward", "1"], ["Backward", "2"], ["Off", "0"]] }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 0
  }, // <--- COMMA HERE
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
    {
      "type": "field_dropdown",
      "name": "PORT", // <--- Ensure this name matches what is in your toolbox
      "options": [
        ["1", "1"],
        ["2", "2"],
        ["3", "3"],
        ["4", "4"],
        ["5", "5"]
      ]
    }
  ],
  "output": "Number", // <--- This allows it to be plugged into logic blocks
  "colour": 210,
  "tooltip": "Reads a value from the Lego sensor port.",
  "helpUrl": ""
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
  "args0": [
    { "type": "input_dummy" },
    { "type": "input_statement", "name": "DO" }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 120,
  "tooltip": "Runs the blocks inside forever (while True)."
},

]); // <--- ONLY CLOSE THE ARRAY HERE (Line 75 area)

// Hook up the buttons
document.getElementById('btnScan').addEventListener('click', window.scanPorts);
document.getElementById('btnRun').addEventListener('click', async () => {
  const code = pythonGenerator.workspaceToCode(workspace);

  if (!writer) {
    alert("Please click 'Scan Ports' (Connect) first!");
    return;
  }

  try {
    const encoder = new TextEncoder();
    // We send the code + a newline to tell the hardware to execute
    await writer.write(encoder.encode(code + "\r\n"));
    console.log("Code sent via Web Serial!");
  } catch (err) {
    console.error("Write error:", err);
  }
});

document.getElementById('btnStop').addEventListener('click', () => {
  fetch('http://localhost:5000/stop', { method: 'POST' })
    .then(() => console.log("Emergency Stop Sent"));
});

// Function to update the side panel
function updatePython() {
  const code = pythonGenerator.workspaceToCode(workspace);
  const output = document.getElementById('pythonOutput');
  if (output) {
    output.innerText = code || "# Drag blocks to see code...";
  }
}

// Attach the listener once
workspace.addChangeListener(updatePython);

// Force resize and initial code preview
window.addEventListener('load', () => {
  Blockly.svgResize(workspace);
  updatePython();
});

window.addEventListener('resize', () => {
  Blockly.svgResize(workspace);
});

document.getElementById('btnClear').addEventListener('click', () => {
  const output = document.getElementById('pythonOutput');
  if (output) {
    output.innerText = "# Console cleared. Move a block to refresh...";
  }
});