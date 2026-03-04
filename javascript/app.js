// Use 'var' to ensure these are globally accessible
var workspace;
var backend; 

// This will hold the latest ports for the blocks to use
var current_serial_ports = [["None Found", ""]]; 

// Update the port refresher to fill this list
function refreshPorts() {
    if (window.backend && window.backend.get_serial_ports) {
        window.backend.get_serial_ports((ports) => {
            if (Array.isArray(ports) && ports.length > 0) {
                // Blockly dropdowns need a specific format: [[LABEL, VALUE], [LABEL, VALUE]]
                current_serial_ports = ports.map(p => [p, p]);
            } else {
                current_serial_ports = [["No Devices Found", ""]];
            }
            
            // Still update the sidebar dropdowns as well
            const selects = document.querySelectorAll('.iface-port');
            selects.forEach(select => {
                const current = select.value;
                select.innerHTML = ports.map(p => 
                    `<option value="${p}" ${p === current ? 'selected' : ''}>${p}</option>`
                ).join('');
            });
        });
    }
}


const toolboxJson = {
    "kind": "categoryToolbox",
    "contents": [
        { "kind": "category", "name": "INTERFACE_B", "colour": "20", "contents": [{ "kind": "block", "type": "interface_b_init" }, { "kind": "block", "type": "additional_interface_b_init" }, { "kind": "block", "type": "interface_b_output" }, { "kind": "block", "type": "interface_b_read" }, { "kind": "block", "type": "interface_b_read_19" }, { "kind": "block", "type": "iface_b_touch" }, { "kind": "block", "type": "iface_b_passive" }, { "kind": "block", "type": "iface_b_active" }] },
        { "kind": "category", "name": "SIMPLE RCX", "colour": "#f1c40f", "contents": [{ "kind": "block", "type": "rcx_init" }, { "kind": "block", "type": "additional_rcx_init" }, { "kind": "block", "type": "rcx_beep" }, { "kind": "block", "type": "rcx_motor_out" }, { "kind": "block", "type": "rcx_close" }] },
        { "kind": "sep" },
        { "kind": "category", "name": "PYSERIAL", "colour": "0", "contents": [{ "kind": "block", "type": "serial_close" }, { "kind": "block", "type": "serial_init" }] },
        { "kind": "sep" },
        { "kind": "category", "name": "LOOPS", "colour": "120", "contents": [{ "kind": "block", "type": "controls_repeat_ext" }, { "kind": "block", "type": "controls_whileUntil" }, { "kind": "block", "type": "wait_seconds" }] },
        { "kind": "category", "name": "LOGIC", "colour": "210", "contents": [{ "kind": "block", "type": "controls_if" }, { "kind": "block", "type": "logic_compare" }, { "kind": "block", "type": "logic_boolean" }] },
        { "kind": "category", "name": "MATH", "colour": "230", "contents": [{ "kind": "block", "type": "math_number" }, { "kind": "block", "type": "math_arithmetic" }] },
        { "kind": "category", "name": "TEXT", "colour": "160", "contents": [{ "kind": "block", "type": "text" }, { "kind": "block", "type": "text_print" }] },
        { "kind": "category", "name": "VARIABLES", "custom": "VARIABLE", "colour": "330" }
    ]
};

function initIDE() {
    if (workspace) return; 

    workspace = Blockly.inject('blocklyDiv', {
        toolbox: toolboxJson,
        renderer: 'geras',
        media: 'media/', 
        sounds: true 
    });
    
workspace.addChangeListener((event) => {
    // 1. Ignore UI events (clicks, scrolls)
    if (event.isUiEvent || event.type === Blockly.Events.FINISHED_LOADING) return;
    
    // 2. Safely check if the generator is ready
    if (python && python.pythonGenerator) {
        try {
            const code = python.pythonGenerator.workspaceToCode(workspace);
            const preview = document.getElementById('pythonOutput');
            if (preview) preview.innerText = code;
        } catch (e) {
            console.error("Generation failed:", e);
        }
    } else {
        // Generator isn't loaded yet, just exit quietly
        console.log("Waiting for Python generator...");
    }
});

    window.workspace = workspace; 
}

function runPython() {
    if (!window.workspace || !window.backend) return;

    // 1. RESET THE CONSOLE (Change 'pythonOutput' to your actual ID)
    const preview = document.getElementById('pythonOutput');
    if (preview) {
        preview.innerText = "Starting script...\n";
    }

    try {
        // 2. GENERATE THE CODE
        let userCode = python.pythonGenerator.workspaceToCode(window.workspace);

        // 3. THE "CRASH-PROOF" WRAPPER
        // We wrap your blocks inside a Python Thread. 
        // This stops the 'While True' from freezing your UI.
        const threadedCode = `
import threading, time, serial

def my_background_task():
    try:
        # Give the loop its own 'ifaces' context
        if 'ifaces' not in globals(): globals()['ifaces'] = {}
        
${userCode.split('\n').map(line => '        ' + line).join('\n')}
    except Exception as e:
        print(f"Loop Error: {e}")

# Run it in the background
t = threading.Thread(target=my_background_task)
t.daemon = True # This kills the thread if the app is closed
t.start()
`;

        // 4. SEND TO BACKEND
        window.backend.run_python(threadedCode);

    } catch (e) {
        console.error("Code Generation Error:", e);
    }
}