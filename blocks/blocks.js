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
    {
        "type": "clear_output_buffer",
        "message0": "%1 Clear Output Buffer",
        "args0": [{ "type": "field_input", "name": "NAME", "text": "IFACE_1" }],
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": 0,
    },
    {
        "type": "clear_input_buffer",
        "message0": "%1 Clear Input Buffer",
        "args0": [{ "type": "field_input", "name": "NAME", "text": "IFACE_1" }],
        "previousStatement": null, 
        "nextStatement": null, 
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
    //{ 
    //    "type": "iface_b_stop_button", 
    //    "message0": "Stop Button on %1", 
    //    "args0": [
    //        { "type": "input_value", "name": "DATA", "check": "String" }
    //    ], 
    //    "output": "Boolean", 
    //    "colour": "#f10f0f" 
    //},
    { 
        "type": "iface_b_stop_button", 
        "message0": "Stop Button on %1", 
        "args0": [{ "type": "field_input", "name": "NAME", "text": "IFACE_1" }],
        "previousStatement": null, 
        "nextStatement": null,
        "colour": "#f10f0f"
    },    

    { 
        "type": "iface_b_touch", 
        "message0": "Touch sensor on %1 using %2", 
        "args0": [
            { "type": "field_dropdown", "name": "PORT", "options": [["PASSIVE 1", "14"], ["PASSIVE 2", "10"], ["PASSIVE 3", "6"], ["PASSIVE 4", "2"]] }, 
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
        "message0": "[%1] RCX Sound %2 play",
        "args0":[
            { "type": "field_input", "name": "NAME", "text": "IFACE_1" }, 
            { "type": "field_dropdown", "name": "rsnd", "options": [["Click", "0"], ["Beep", "1"], ["Sweep Down", "2"], ["Sweep Up", "3"], ["Error", "4"], ["Fast Sweep", "5"]] },
        ],
        "previousStatement": null,
        "nextStatement": null, 
        "colour": "#f1c40f", 
    },
    {
        "type": "rcx_close", 
        "message0": "[%1].close()",
        "args0":[
            { "type": "field_input", "name": "NAME", "text": "IFACE_1" },
        ],
        "previousStatement": null,
        "nextStatement": null, 
        "colour": "#f1c40f", 
    },
    { 
        "type": "rcx_motor_out_on", 
        "message0": " [%1] Set Motor %2 On", 
        "args0": [ 
            { "type": "field_input", "name": "NAME", "text": "rcx_1" },
            { "type": "field_dropdown", "name": "MPORT", "options": [["A", "A"], ["B", "B"], ["C", "C"]] }, 
        ], 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#f1c40f" 
    },
    { 
        "type": "rcx_motor_out_off", 
        "message0": " [%1] Set Motor %2 Off", 
        "args0": [ 
            { "type": "field_input", "name": "NAME", "text": "rcx_1" },
            { "type": "field_dropdown", "name": "MPORT", "options": [["A", "A"], ["B", "B"], ["C", "C"]] }, 
        ], 
        "previousStatement": null, 
        "nextStatement": null, 
        "colour": "#f1c40f" 
    },
// ---------- WEDO 1.0 HUB ----------

    {
    "type": "wedo_motor_move",
    "message0": "Move WeDo Motor on %1 at power %2",
    "args0": [
        {
        "type": "field_dropdown",
        "name": "PORT",
        "options": [
            ["Port A", "PORT_A"],
            ["Port B", "PORT_B"]
        ]
        },
        {
        "type": "input_value",
        "name": "POWER",
        "check": "Number"
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160,
    "tooltip": "Moves the motor at a power level between -127 and 127",
    "helpUrl": ""
    },

    {
    "type": "wedo_light_sensor",
    "message0": "Read Light Sensor on %1",
    "args0": [
        {
        "type": "field_dropdown",
        "name": "PORT",
        "options": [
            ["Port A", "2"], 
            ["Port B", "3"]
        ]
        }
    ],
    "output": "Number",
    "colour": 230,
    "tooltip": "Returns the light level from the sensor on the selected port.",
    "helpUrl": ""
    },
    {
    "type": "wedo_sensor_led",
    "message0": "Set Light Sensor LED on %1 to %2",
    "args0": [
        {
        "type": "field_dropdown",
        "name": "PORT",
        "options": [["Port A", "PORT_A"], ["Port B", "PORT_B"]]
        },
        {
        "type": "field_dropdown",
        "name": "STATE",
        "options": [["ON", "127"], ["OFF", "0"]]
        }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 160
    },

    {
    "type": "wedo_tilt_sensor",
    "message0": "Read Tilt Sensor on %1",
    "args0": [
        {
        "type": "field_dropdown",
        "name": "PORT",
        "options": [
            ["Port A", "2"],
            ["Port B", "3"]
        ]
        }
    ],
    "output": "Number",
    "colour": 230,
    "tooltip": "Returns a value (0-255) based on the tilt direction.",
    "helpUrl": ""
    },
    {
    "type": "wedo_tilt_direction",
    "message0": "Tilt Direction on %1",
    "args0": [
        {
        "type": "field_dropdown",
        "name": "PORT",
        "options": [
            ["Port A", "2"],
            ["Port B", "3"]
        ]
        }
    ],
    "output": "Number",
    "colour": 230,
    "tooltip": "Returns: 0=Flat, 1=Forward, 2=Back, 3=Left, 4=Right",
    "helpUrl": ""
    },
    {
    "type": "wedo_dashboard",
    "message0": "Show WeDo Debug Dashboard",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 20,
    "tooltip": "Prints Light, Tilt, and Distance raw values to the console.",
    "helpUrl": ""
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