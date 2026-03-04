// This file doesn't seam to do anything?????

const py = python.pythonGenerator;

// --- Interface B Logic ---
py.forBlock['interface_b_init'] = (block) => {
    const name = block.getFieldValue('NAME');
    const port = getInterfaceMapping()[name] || "/dev/ttyUSB0";
    return `import serial, time\nif 'ifaces' not in globals(): ifaces = {}\nif '${name}' not in ifaces:\n    ifaces['${name}'] = {'ser': serial.Serial('${port}', 9600, timeout=0)}\n    ifaces['${name}']['ser'].write(b'p\\0###Do you byte, when I knock?$$$')\n    time.sleep(0.1)\n`;
};
py.forBlock['additional_interface_b_init'] = (block) => {
    const name = block.getFieldValue('NAME');
    const port = getInterfaceMapping()[name] || "/dev/ttyUSB0";
    return `import serial, time\nif 'ifaces' not in globals(): ifaces = {}\nif '${name}' not in ifaces:\n    ifaces['${name}'] = {'ser': serial.Serial('${port}', 9600, timeout=0)}\n    ifaces['${name}']['ser'].write(b'p\\0###Do you byte, when I knock?$$$')\n    time.sleep(0.1)\n`;
};
py.forBlock['interface_b_read_19'] = (block) => [`ifaces['${block.getFieldValue('NAME')}']['ser'].read(19) if ('${block.getFieldValue('NAME')}' in ifaces and ifaces['${block.getFieldValue('NAME')}']['ser'].in_waiting >= 19) else b'\\x00'*19`, 0];

py.forBlock['iface_b_touch'] = (block) => {
    const data = py.valueToCode(block, 'DATA', 0) || "b'\\x00'*19";
    return [`int.from_bytes(bytes(${data})[${block.getFieldValue('PORT')}:${parseInt(block.getFieldValue('PORT'))+2}], 'big') < 500`, 0];
};

// --- RCX Logic ---
py.forBlock['rcx_init'] = (block) => {
    const name = block.getFieldValue('NAME');
    const port = getInterfaceMapping()[name] || "/dev/ttyUSB0";
    return `import serial, time\nif 'ifaces' not in globals(): ifaces = {}\nif '${name}' in ifaces:\n    try: ifaces['${name}']['ser'].close()\n    except: pass\ntry:\n    ifaces['${name}'] = {'ser': serial.Serial('${port}', 2400, parity='O', timeout=0.05), 'seq': 0x00}\n    print("RCX ${name} READY")\nexcept Exception as e: print(f"ERR: {e}")\n`;
};

py.forBlock['additional_rcx_init'] = (block) => {
    const name = block.getFieldValue('NAME');
    const port = getInterfaceMapping()[name] || "/dev/ttyUSB0";
    return `import serial, time\nif 'ifaces' not in globals(): ifaces = {}\nif '${name}' in ifaces:\n    try: ifaces['${name}']['ser'].close()\n    except: pass\ntry:\n    ifaces['${name}'] = {'ser': serial.Serial('${port}', 2400, parity='O', timeout=0.05), 'seq': 0x00}\n    print("RCX ${name} READY")\nexcept Exception as e: print(f"ERR: {e}")\n`;
};

py.forBlock['rcx_sensor_init'] = (block) => {
    const name = block.getFieldValue('NAME');
    const port = block.getFieldValue('PORT');
    const type = block.getFieldValue('TYPE');
    return `if '${name}' in ifaces:\n    ser = ifaces['${name}']['ser']\n    def send_s(op, v):\n        ifaces['${name}']['seq'] = 0x08 if ifaces['${name}']['seq'] == 0x00 else 0x00\n        f_op = op | ifaces['${name}']['seq']\n        pkt = bytearray([0x55, 0xff, 0x00, f_op, f_op^0xFF, v, v^0xFF, (f_op+v)&0xFF, ((f_op+v)&0xFF)^0xFF])\n        ser.write(pkt); ser.flush(); time.sleep(0.1)\n    send_s(0x42, int(${port}) | (int(${type}) << 3))\n    send_s(0x32, int(${port}) | (0x00 << 5))\n`;
};

py.forBlock['rcx_update_sensor'] = (block) => {
    const name = block.getFieldValue('NAME');
    const port = block.getFieldValue('PORT');
    return `if '${name}' in ifaces:\n    if 'rcx_vals' not in globals(): rcx_vals = {}\n    ser = ifaces['${name}']['ser']\n    ifaces['${name}']['seq'] = 0x08 if ifaces['${name}']['seq'] == 0x00 else 0x00\n    op = 0x12 | ifaces['${name}']['seq']\n    pkt = bytearray([0x55, 0xff, 0x00, op, op^0xFF, int(${port}), int(${port})^0xFF, (op+int(${port}))&0xFF, ((op+int(${port}))&0xFF)^0xFF])\n    ser.reset_input_buffer(); ser.write(pkt); ser.flush(); time.sleep(0.15)\n    if ser.in_waiting >= 14:\n        res = ser.read(ser.in_waiting); idx = res.rfind(b'\\x55\\xff')\n        if idx != -1 and len(res) >= idx + 8: rcx_vals['${name}_${port}'] = (res[idx+7]<<8)|res[idx+5]\n`;
};

py.forBlock['rcx_sensor_value'] = (block) => [`rcx_vals.get('${block.getFieldValue('NAME')}_${block.getFieldValue('PORT')}', 0)`, 0];
py.forBlock['wait_seconds'] = (block) => `time.sleep(${block.getFieldValue('SEC')})\n`;