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

// Register the generator for the Output block
pythonGenerator.forBlock['interface_b_output'] = function(block, generator) {
  // Get the value from the 'VALUE' input (the hole where you snap blocks in)
  const value = generator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ATOMIC) || "''";
  
  // Generate the Python code (e.g., printing to Interface B's serial port)
  // Assuming your serial object is named 'ser'
  return `ser.write(str(${value}).encode() + '\\n')\n`;
};
};

pythonGenerator.forBlock['interface_b_init'] = function(block) {
  const code = `import serial
import time

# Setup Serial Connection
ser = serial.Serial(
    port='/dev/cu.PL2303G-USBtoUART2420'
)

# Handshake with Interface B
msg = b'p\\0###Do you byte, when I knock?$$$'
ser.write(msg)
print("Sending Handshake...")
print(ser.read(31))\n`;

  return code;
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
  // Use valueToCode to get the text from the connected 'TEXT' block
  const text = pythonGenerator.valueToCode(block, 'TEXT', pythonGenerator.ORDER_ATOMIC) || "''";
  
  // This will generate: print("your text here")
  return `print(${text})\n`;
};

pythonGenerator.forBlock['wait_seconds'] = function(block) {
  const seconds = block.getFieldValue('SECONDS');
  return `time.sleep(${seconds})\n`;
};
pythonGenerator.forBlock['interface_b_forever'] = function(block) {
  const branch = pythonGenerator.statementToCode(block, 'DO');
  // Adding a tiny 0.01s sleep prevents the serial port from crashing
  return 'while True:\n' + (branch || '  pass\n') + '  time.sleep(0.01)\n';
};