/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import { pythonGenerator } from 'blockly/python';
const storageKey = 'mainWorkspace';

/**
 * Saves the state of the workspace to browser's local storage.
 * @param {Blockly.Workspace} workspace Blockly workspace to save.
 */
export const save = function (workspace) {
  const data = Blockly.serialization.workspaces.save(workspace);
  window.localStorage?.setItem(storageKey, JSON.stringify(data));
};

/**
 * Loads saved state from local storage into the given workspace.
 * @param {Blockly.Workspace} workspace Blockly workspace to load into.
 */
export const load = function (workspace) {
  const data = window.localStorage?.getItem(storageKey);
  if (!data) return;

  // Don't emit events during loading.
  Blockly.Events.disable();
  Blockly.serialization.workspaces.load(JSON.parse(data), workspace, false);
  Blockly.Events.enable();
};


export const initSerialization = () => {
  console.log(" Initializing Generators...");
  // --- SAFETY FIX START ---
  if (!pythonGenerator.Order) {
    pythonGenerator.Order = {
      ATOMIC: 0,
      FUNCTION_CALL: 99
    };
  }

//Converting to full python
  // 1. INIT BLOCK
// The Initialization Block
pythonGenerator.forBlock['interface_b_init'] = function(block) {
  // This generates the exact readable Python code
  return "interface.ser.write(b'p\\0###Do you byte, when I knock?$$$')\nprint(interface.ser.read(31))\n";
};

  // 2. WAKE UP BLOCK
  pythonGenerator.forBlock['Wake_up'] = function(block) {
    return "ser.write(bytearray([0x02]))\ntime.sleep(0.1)\n";
  };

  // 3. INPUT BLOCK (The sensor reader)
  pythonGenerator.forBlock['interface_b_input'] = function(block) {
    const port = block.getFieldValue('PORT');
    const code = `get_sensor(${port})`; // Changed iface. to match your ser setup
    return [code, pythonGenerator.Order.FUNCTION_CALL];
  };

// The Motor Block
pythonGenerator.forBlock['interface_b_output'] = function(block) {
  const port = parseInt(block.getFieldValue('OUT')); // e.g., 1, 2, 4, or 8
  const action = block.getFieldValue('DIR');        // e.g., 0x91, 0x90
  
  return `interface.set_motor(${port}, ${action})\n`;
};

  // 5. OTHER BLOCKS
pythonGenerator.forBlock['add_text'] = function(block, generator) {
  // Use 'generator' and the number 0 (the value for ATOMIC) 
  // to avoid the "undefined" crash
  const text = generator.valueToCode(block, 'TEXT', 0) || "''";
  
  // This generates: print("your text")
  return `print(${text})\n`;
};

  pythonGenerator.forBlock['wait_seconds'] = function(block) {
    const seconds = block.getFieldValue('SECONDS');
    return `time.sleep(${seconds})\n`;
  };

  pythonGenerator.forBlock['interface_b_forever'] = function(block) {
    const branch = pythonGenerator.statementToCode(block, 'DO');
    return 'while True:\n' + (branch || '  pass\n') + '  time.sleep(0.01)\n';
  };

  console.log(" All Generators Registered!");
};