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
    {
      "kind": "category",
      "name": "Interface B",
      "colour": "20",
      "contents": [
        { "kind": "block", "type": "interface_b_init" },
        { "kind": "block", "type": "keep_alive" },
        { "kind": "block", "type": "additional_interface_b_init" },
        { "kind": "block", "type": "interface_b_output" },
        { "kind": "block", "type": "interface_b_read" },
        { "kind": "block", "type": "interface_b_read_19" },
        { "kind": "block", "type": "iface_b_touch" },
        { "kind": "block", "type": "iface_b_passive" },
        { "kind": "block", "type": "iface_b_active" }
      ]
    },
    {
      "kind": "category",
      "name": "Simple RCX",
      "colour": "#f1c40f",
      "contents": [
        { "kind": "block", "type": "rcx_init" },
        { "kind": "block", "type": "additional_rcx_init" },
        { "kind": "block", "type": "rcx_beep" },
        { "kind": "block", "type": "rcx_motor_out_on" },
        { "kind": "block", "type": "rcx_motor_out_off" },
        { "kind": "block", "type": "rcx_close" }
      ]
    },
    { "kind": "sep" },
    {
      "kind": "category",
      "name": "PySerial",
      "colour": "0",
      "contents": [
        { "kind": "block", "type": "serial_init" },
        { "kind": "block", "type": "serial_close" }
      ]
    },
    { "kind": "sep" },
    {
      "kind": "category",
      "name": "Loops",
      "colour": "120",
      "contents": [
        { "kind": "block", "type": "controls_repeat_ext" },
        { "kind": "block", "type": "controls_whileUntil" },
        { "kind": "block", "type": "controls_forEach" },
        { "kind": "block", "type": "wait_seconds" },
        { "kind": "block", "type": "controls_flow_statements" }
      ]
    },
    {
      "kind": "category",
      "name": "Logic",
      "colour": "210",
      "contents": [
        { "kind": "block", "type": "controls_if" },
        { "kind": "block", "type": "logic_compare" },
        { "kind": "block", "type": "logic_operation" },
        { "kind": "block", "type": "logic_negate" },
        { "kind": "block", "type": "logic_boolean" },
        { "kind": "block", "type": "logic_null" },
        { "kind": "block", "type": "logic_ternary" }
      ]
    },
    {
      "kind": "category",
      "name": "Math",
      "colour": "230",
      "contents": [
        { "kind": "block", "type": "math_number", "fields": { "NUM": 123 } },
        {
          "kind": "block",
          "type": "math_arithmetic",
          "inputs": {
            "A": { "shadow": { "type": "math_number", "fields": { "NUM": 1 } } },
            "B": { "shadow": { "type": "math_number", "fields": { "NUM": 1 } } }
          }
        },
        {
          "kind": "block",
          "type": "math_single",
          "inputs": {
            "NUM": { "shadow": { "type": "math_number", "fields": { "NUM": 9 } } }
          }
        },
        {
          "kind": "block",
          "type": "math_trig",
          "inputs": {
            "NUM": { "shadow": { "type": "math_number", "fields": { "NUM": 45 } } }
          }
        },
        { "kind": "block", "type": "math_constant" },
        {
          "kind": "block",
          "type": "math_number_property",
          "inputs": {
            "NUMBER_TO_CHECK": { "shadow": { "type": "math_number", "fields": { "NUM": 0 } } }
          }
        },
        {
          "kind": "block",
          "type": "math_round",
          "fields": { "OP": "ROUND" },
          "inputs": {
            "NUM": { "shadow": { "type": "math_number", "fields": { "NUM": 3.1 } } }
          }
        },
        { "kind": "block", "type": "math_on_list", "fields": { "OP": "SUM" } },
        {
          "kind": "block",
          "type": "math_modulo",
          "inputs": {
            "DIVIDEND": { "shadow": { "type": "math_number", "fields": { "NUM": 64 } } },
            "DIVISOR": { "shadow": { "type": "math_number", "fields": { "NUM": 10 } } }
          }
        },
        {
          "kind": "block",
          "type": "math_constrain",
          "inputs": {
            "VALUE": { "shadow": { "type": "math_number", "fields": { "NUM": 50 } } },
            "LOW": { "shadow": { "type": "math_number", "fields": { "NUM": 1 } } },
            "HIGH": { "shadow": { "type": "math_number", "fields": { "NUM": 100 } } }
          }
        },
        {
          "kind": "block",
          "type": "math_random_int",
          "inputs": {
            "FROM": { "shadow": { "type": "math_number", "fields": { "NUM": 1 } } },
            "TO": { "shadow": { "type": "math_number", "fields": { "NUM": 100 } } }
          }
        },
        { "kind": "block", "type": "math_random_float" },
        {
          "kind": "block",
          "type": "math_atan2",
          "inputs": {
            "X": { "shadow": { "type": "math_number", "fields": { "NUM": 1 } } },
            "Y": { "shadow": { "type": "math_number", "fields": { "NUM": 1 } } }
          }
        }
      ]
    },
    {
      "kind": "category",
      "name": "Text",
      "colour": "160",
      "contents": [
        { "kind": "block", "type": "add_text" },
        { "kind": "block", "type": "text" },
        { "kind": "block", "type": "text_print" },
        { "kind": "block", "type": "text_join" },
        {
          "kind": "block",
          "type": "text_append",
          "inputs": {
            "TEXT": { "shadow": { "type": "text", "fields": { "TEXT": "" } } }
          }
        },
        {
          "kind": "block",
          "type": "text_length",
          "inputs": {
            "VALUE": { "shadow": { "type": "text", "fields": { "TEXT": "abc" } } }
          }
        },
        {
          "kind": "block",
          "type": "text_isEmpty",
          "inputs": {
            "VALUE": { "shadow": { "type": "text", "fields": { "TEXT": "" } } }
          }
        },
        {
          "kind": "block",
          "type": "text_indexOf",
          "inputs": {
            "VALUE": { "block": { "type": "variables_get" } },
            "FIND": { "shadow": { "type": "text", "fields": { "TEXT": "abc" } } }
          }
        },
        {
          "kind": "block",
          "type": "text_charAt",
          "inputs": {
            "VALUE": { "block": { "type": "variables_get" } }
          }
        },
        {
          "kind": "block",
          "type": "text_getSubstring",
          "inputs": {
            "STRING": { "block": { "type": "variables_get" } }
          }
        },
        {
          "kind": "block",
          "type": "text_changeCase",
          "inputs": {
            "TEXT": { "shadow": { "type": "text", "fields": { "TEXT": "abc" } } }
          }
        },
        {
          "kind": "block",
          "type": "text_trim",
          "inputs": {
            "TEXT": { "shadow": { "type": "text", "fields": { "TEXT": "abc" } } }
          }
        },
        {
          "kind": "block",
          "type": "text_count",
          "inputs": {
            "SUB": { "shadow": { "type": "text" } },
            "TEXT": { "shadow": { "type": "text" } }
          }
        },
        {
          "kind": "block",
          "type": "text_replace",
          "inputs": {
            "FROM": { "shadow": { "type": "text" } },
            "TO": { "shadow": { "type": "text" } },
            "TEXT": { "shadow": { "type": "text" } }
          }
        },
        {
          "kind": "block",
          "type": "text_reverse",
          "inputs": {
            "TEXT": { "shadow": { "type": "text" } }
          }
        }
      ]
    },
    {
      "kind": "category",
      "name": "Lists",
      "colour": "260",
      "contents": [
        { "kind": "block", "type": "lists_create_with" },
        {
          "kind": "block",
          "type": "lists_repeat",
          "inputs": {
            "NUM": { "shadow": { "type": "math_number", "fields": { "NUM": 5 } } }
          }
        },
        { "kind": "block", "type": "lists_length" },
        { "kind": "block", "type": "lists_isEmpty" },
        {
          "kind": "block",
          "type": "lists_indexOf",
          "inputs": { "VALUE": { "block": { "type": "variables_get" } } }
        },
        {
          "kind": "block",
          "type": "lists_getIndex",
          "inputs": { "VALUE": { "block": { "type": "variables_get" } } }
        },
        {
          "kind": "block",
          "type": "lists_setIndex",
          "inputs": { "LIST": { "block": { "type": "variables_get" } } }
        },
        {
          "kind": "block",
          "type": "lists_getSublist",
          "inputs": { "LIST": { "block": { "type": "variables_get" } } }
        },
        {
          "kind": "block",
          "type": "lists_split",
          "inputs": {
            "DELIM": { "shadow": { "type": "text", "fields": { "TEXT": "," } } }
          }
        },
        { "kind": "block", "type": "lists_sort" },
        { "kind": "block", "type": "lists_reverse" }
      ]
    },
    {
      "kind": "category",
      "name": "Variables",
      "colour": "330",
      "custom": "VARIABLE"
    }
  ]
}

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