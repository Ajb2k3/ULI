Blockly.defineBlocksWithJsonArray([
    {
        "type": "add_text",
        "message0": "add text %1",
        "args0": [{ "type": "input_value", "name": "TEXT", "check": "String" }],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160
    },
    // --- PySerial Communication ---
    { 
        "type": "serial_init", 
        "message0": "Initialise Interface B: %1", 
        "args0": [{ "type": "field_input", "name": "NAME", "text": "IFACE_1" }], 
        "nextStatement": null, 
        "colour": 0, 
        "style": { "hat": "cap" } 
    },
    {
        "type": "serial_close", 
        "message0": "Close the Serial Port: %1", 
        "args0": [{ "type": "field_input", "name": "NAME", "text": "IFACE_1" }], 
        "previousStatement": null,  
        "colour": 0, 
    },

    // --- INTERFACE B ---
    { 
        "type": "interface_b_init", 
        "message0": "Initialise Interface B: %1", 
        "args0": [{ "type": "field_input", "name": "NAME", "text": "IFACE_1" }], 
        "nextStatement": null, 
        "colour": 20, 
        "style": { "hat": "cap" } 
    },
    {
        "type": "additional_interface_b_init", 
        "message0": "Initialise aditional Interface B: %1", 
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "IFACE_2" },
        ], 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": 20, 
    },
    { 
        "type": "interface_b_output", 
        "message0": "[%1] Motor %2 Dir %3", 
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "IFACE_1" }, 
            { "type": "field_dropdown", "name": "OUT", "options": [["A","0x01"],["B","0x02"],["C","0x04"],["D","0x08"],["E","0x10"],["F","0x20"],["G","0x40"],["H","0x80"]] }, 
            { "type": "field_dropdown", "name": "DIR", "options": [["Forward","0x91"],["Reverse","0x95"],["Off","0x90"]] }
        ], 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": 0 
    },
    { 
        "type": "interface_b_read", 
        "message0": "[%1] Read Handshake (32 bytes)", 
        "args0": [{ "type": "field_input", "name": "NAME", "text": "IFACE_1" }], 
        "output": null, 
        "colour": 20 
    },
    { 
        "type": "interface_b_read_19", 
        "message0": "[%1] Read Data Packet (19 bytes)", 
        "args0": [{ "type": "field_input", "name": "NAME", "text": "IFACE_1" }], 
        "output": null, 
        "colour": 20 
    },
    {
        "type": "keep_alive", 
        "message0": "[%1] Keep connection alive", 
        "args0": [{ "type": "field_input", "name": "NAME", "text": "IFACE_1" }], 
        "previousStatement": null, 
        "nextStatement": null,
        "colour": "#f10f0f"  
    },
    { 
        "type": "iface_b_touch", 
        "message0": "Touch sensor on %1 using %2", 
        "args0": [
            { "type": "field_dropdown", "name": "PORT", "options": [["PASSIVE 1", "14"], ["PASSIVE 2", "12"], ["PASSIVE 3", "10"], ["PASSIVE 4", "8"]] }, 
            { "type": "input_value", "name": "DATA", "check": "String" }
        ], 
        "output": "Boolean", 
        "colour": "#f1c40f" 
    },
// --- PASSIVE PORTS (YELLOW) ---
    { 
        "type": "iface_b_passive", 
        "message0": "[%1] Passive sensor on %2 using %3", 
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "IFACE_1" },
            { 
                "type": "field_dropdown", 
                "name": "PORT", 
                "options": [
                    ["Port 1", "14"], ["Port 2", "10"], ["Port 3", "6"], ["Port 4", "2"]
                ]
            }, 
            { "type": "input_value", "name": "DATA" }
        ], 
        "output": "Number", 
        "colour": "#f1c40f" // Yellow
    },

    // --- ACTIVE PORTS (BLUE) ---
    { 
        "type": "iface_b_active", 
        "message0": "Active sensor on %1 using %2", 
        "args0": [
            { 
                "type": "field_dropdown", 
                "name": "PORT", 
                "options": [
                    ["Port 5", "16"], ["Port 6", "12"], ["Port 7", "8"], ["Port 8", "4"]
                ] 
            }, 
            { "type": "input_value", "name": "DATA" }
        ], 
        "output": "Number", 
        "colour": "#3498db" // Blue
    },
    

// --- RCX ---
    { 
        "type": "rcx_init", 
        "message0": "Initialise RCX: %1", 
        "args0": [{ "type": "field_input", "name": "NAME", "text": "IFACE_1" }], 
        "nextStatement": null, 
        "colour": "#f1c40f", 
        "style": { "hat": "cap" } 
    },
        { 
        "type": "additional_rcx_init", 
        "message0": "Initialise Additional RCX: %1", 
        "args0": [{ "type": "field_input", "name": "NAME", "text": "IFACE_1" }], 
        "previousStatement": null,
        "nextStatement": null, 
        "colour": "#f1c40f", 
    },
    {
        "type": "rcx_beep", 
        "message0": "RCX Sound %1 play",
        "args0":[
            {"type": "field_dropdown", "name": "rsnd", "options": [["Click", "0"], ["Beep", "1"], ["Sweep Down", "2"], ["Sweep Up", "3"], ["Error", "4"], ["Fast Sweep", "5"]] },
        ],
        "previousStatement": null,
        "nextStatement": null, 
        "colour": "#f1c40f", 
    },
    {
        "type": "rcx_close", 
        "message0": "RCX.close()",
        "previousStatement": null,
        "nextStatement": null, 
        "colour": "#f1c40f", 
    },
    { 
        "type": "rcx_motor_out", 
        "message0": " Set Motor %1 On", 
        "args0": [ 
            { "type": "field_dropdown", "name": "MPORT", "options": [["A", "rcx.A"], ["B", "rcx.B"], ["C", "rcx.C"]] }, 
        ], 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#f1c40f" 
    },
 

    // --- UTILS ---
  { 
  "type": "wait_seconds", 
  "message0": "wait %1 seconds", 
  "args0": [{ 
    "type": "field_number", 
    "name": "SEC", 
    "value": 0.1,
    "min": 0,
    "precision": 0.01 
  }], 
  "previousStatement": null, 
  "nextStatement": null, 
  "colour": 120 
}
]);