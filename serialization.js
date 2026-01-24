/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

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

import { pythonGenerator } from 'blockly/python';

export const initSerialization = () => {
  // Fix for interface_b_input
  pythonGenerator.forBlock['interface_b_input'] = function(block) {
    const port = block.getFieldValue('PORT');
    const code = `iface.get_sensor(${port})`;
    
    // Check if Order exists on the generator, otherwise use the global Order
    // Order.ATOMIC or Order.FUNCTION_CALL are usually index 0 or 2
    const order = pythonGenerator.Order ? pythonGenerator.Order.FUNCTION_CALL : 2;
    
    return [code, order];
  };

  // Fix for interface_b_output
  pythonGenerator.forBlock['interface_b_output'] = function(block) {
    const out = block.getFieldValue('OUT');
    const pwr = pythonGenerator.valueToCode(block, 'POWER', pythonGenerator.Order ? pythonGenerator.Order.ATOMIC : 0) || '0';
    const dir = block.getFieldValue('DIR');
    return `iface.set_output(${out}, ${pwr}, ${dir})\n`;
  };
};

  pythonGenerator.forBlock['interface_b_stop_all'] = function() {
    return `iface.stop_all()\n`;
  };

  pythonGenerator.forBlock['Wake_up'] = function(block) {
    // This command typically sends a hex clear or initialization byte
    return "iface.ser.write(bytearray([0x00])) # Wake up / Clear buffer\ntime.sleep(0.1)\n";
  };

  pythonGenerator.forBlock['interface_b_input'] = function(block) {
  const port = block.getFieldValue('PORT');
  // This generates a function call like: iface.get_sensor(0)
  const code = `iface.get_sensor(${port})`;
  return [code, pythonGenerator.Order.FUNCTION_CALL];
};
pythonGenerator.forBlock['interface_b_stop_all'] = function(block) {
  // This calls the stop_all method we wrote in the Python app.py
  return "iface.stop_all()\n";
};

pythonGenerator.forBlock['add_text'] = function(block) {
  const text = block.getFieldValue('TEXT');
  // This adds a print statement to the Python code
  return `print("${text}")\n`;
};

pythonGenerator.forBlock['wait_seconds'] = function(block) {
  const seconds = block.getFieldValue('SECONDS');
  return `time.sleep(${seconds})\n`;
};