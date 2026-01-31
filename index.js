// --- 1. Basic Setup ---
console.log("Checking for Blockly...");
if (typeof Blockly === 'undefined') {
    console.error("Blockly is still not loaded!");
} else {
    console.log("Blockly loaded successfully!");
}

// --- 2. Define the Toolbox (The sidebar menu) ---
const toolboxDefinition = {
  'kind': 'categoryToolbox',
  'contents': [
    {
      'kind': 'category',
      'name': 'Interface B',
      'colour': '20',
      'contents': [
        { 'kind': 'block', 'type': 'interface_b_init' },
        { 'kind': 'block', 'type': 'interface_b_output' },
        { 'kind': 'block', 'type': 'interface_b_stop_all' },
        { 'kind': 'block', 'type': 'wait_seconds' }
      ]
    },
    { 'kind': 'category', 'name': 'Logic', 'colour': '210', 'contents': [{ 'kind': 'block', 'type': 'controls_if' }] }
  ]
};

// --- 3. Define the Theme ---
const interfaceTheme = Blockly.Theme.defineTheme('interfaceTheme', {
  'base': Blockly.Themes.Classic,
  'categoryStyles': {
    'interface_category': { 'colour': '160' }
  },
  'startHats': true,
});

// --- 4. Setup the Generator (Python Code Logic) ---
const initSerialization = () => {
  const generator = python.pythonGenerator;

  generator.forBlock['interface_b_init'] = function(block) {
    return "interface.initialise()\n";
  };

  generator.forBlock['interface_b_output'] = function(block) {
    const port = block.getFieldValue('OUT'); 
    const dir = block.getFieldValue('DIR');
    let cmd = "0x90"; // Default Off
    if (dir === "1") cmd = "0x91";
    if (dir === "2") cmd = "0x95";
    
    return `interface.set_motor(${port}, ${cmd})\n`;
  };

  generator.forBlock['wait_seconds'] = function(block) {
    const seconds = block.getFieldValue('SECONDS');
    return `time.sleep(${seconds})\n`;
  };
};

// --- 5. Inject Blockly (The visual editor) ---
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxDefinition,
  theme: interfaceTheme,
  grid: { spacing: 25, length: 3, colour: '#ccc', snap: true },
  move: { scrollbars: true, drag: true, wheel: true },
  zoom: { controls: true, wheel: true, startScale: 1.0 },
  trashcan: true,
});

// Now initialize the generators
initSerialization();

// --- 6. Block Definitions (The shapes of the blocks) ---
Blockly.defineBlocksWithJsonArray([
  // ... Paste all your blocks here (interface_b_init, interface_b_output, etc.) ...
]);

// --- 7. The Bridge / Run Function ---
const runCode = () => {
    const code = python.pythonGenerator.workspaceToCode(workspace);
    if (window.backend) {
        window.backend.execute_python(code);
    } else {
        console.log("Python Bridge not found. Generated Code:\n", code);
    }
};

document.getElementById('btnRun').onclick = runCode;

// --- 8. Event Listeners ---
function updatePython() {
  const code = python.pythonGenerator.workspaceToCode(workspace);
  const output = document.getElementById('pythonOutput');
  if (output) {
    output.innerText = code || "# Drag blocks to see code...";
  }
}

workspace.addChangeListener(updatePython);
window.addEventListener('resize', () => Blockly.svgResize(workspace));