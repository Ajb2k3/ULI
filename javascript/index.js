// index.js
const toolbox = {
  'kind': 'flyoutToolbox',
  'contents': [
    { 'kind': 'block', 'type': 'interface_b_init' },
    { 'kind': 'block', 'type': 'interface_b_output' }
  ]
};

// Wait for the window to be fully loaded
window.onload = () => {
    const blocklyDiv = document.getElementById('blocklyDiv');
    
    // Check if the div actually exists
    if (!blocklyDiv) {
        console.error("Could not find blocklyDiv!");
        return;
    }

    const workspace = Blockly.inject(blocklyDiv, {
        toolbox: toolbox,
        scrollbars: true
    });

    console.log("Workspace injected!");
};