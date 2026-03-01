import serial
import time

class RCX10:
    def __init__(self, port):
        # RCX 1.0 Protocol setup
        self.ser = serial.Serial(port, 2400, parity=serial.PARITY_ODD, timeout=1)

    def send_packet(self, opcode, args=[]):
        """Standard RCX Packet Construction"""
        body = [opcode, opcode ^ 0xFF]
        for arg in args:
            body.append(arg)
            body.append(arg ^ 0xFF)
        
        checksum = sum(body) & 0xFF
        packet = bytearray([0x55, 0xff, 0x00] + body + [checksum, checksum ^ 0xFF])
        self.ser.write(packet)
        time.sleep(0.05)

    # Simple Methods for Blockly to call
    def motor_on(self, motor_id): # 1 for A, 2 for B, 4 for C
        self.send_packet(0x21, [0x80 | motor_id])

    def motor_off(self, motor_id):
        self.send_packet(0x22, [0x40 | motor_id])
        
    def play_sound(self, sound_id): # 0-5
        self.send_packet(0x51, [sound_id])

    def close(self):
        self.ser.close()