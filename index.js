import * as Blockly from 'blockly';
import { pythonGenerator } from 'blockly/python';
import 'blockly/blocks';

// This is the standard way to load the built-in block generators in NPM
import 'blockly/python'; 

// IMPORTANT: If you use "Logic" or "Math" blocks from the toolbox, 
// they need the generator. Use this to ensure they are loaded:
import { libraryBlocks } from 'blockly/blocks';
import { toolbox } from './toolbox.js';
import { initSerialization } from './serialization.js';

// Initialize serialization (Adam Bryant's Python logic)
initSerialization();

// Inject Workspace
const workspace = Blockly.inject('blocklyDiv', {
  
toolbox: toolbox,
  grid: { spacing: 25, length: 3, colour: '#ccc', snap: true },
  move: { scrollbars: true, drag: true, wheel: true },
  zoom: { controls: true, wheel: true, startScale: 1.0 },
  trashcan: true
});

// Update Python preview in real-time
workspace.addChangeListener(() => {
  const code = pythonGenerator.workspaceToCode(workspace);
  const output = document.getElementById('pythonOutput');
  if (output) {
    output.innerText = code;
  }
});

// Port Scanning Logic (for Safari/Mac compatibility)
window.scanPorts = async () => {
    try {
        const res = await fetch('http://127.0.0.1:5000/list_ports');
        const data = await res.json();
        const selector = document.getElementById('portSelector');
        selector.innerHTML = data.ports.map(p => `<option value="${p}">${p}</option>`).join('');
    } catch (e) {
        alert("Flask server not found. Is app.py running?");
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
    "colour": 160
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
]); // <--- ONLY CLOSE THE ARRAY HERE (Line 75 area)

// Hook up the buttons
document.getElementById('btnScan').addEventListener('click', window.scanPorts);
document.getElementById('btnRun').addEventListener('click', () => {
  const code = pythonGenerator.workspaceToCode(workspace);
  
  console.log("Sending code to Interface B...");

  fetch('http://localhost:5000/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code })
  })
  .then(response => response.json())
  .then(data => console.log("Hardware Response:", data.status))
  .catch(err => console.error("Is the Python server running?", err));
});
document.getElementById('btnStop').addEventListener('click', () => {
  fetch('http://localhost:5000/stop', { method: 'POST' })
    .then(() => console.log("Emergency Stop Sent"));
});