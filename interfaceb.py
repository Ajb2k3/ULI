import serial

class InterfaceB:
    def __init__(self, port):
        # Open serial connection (9600 baud is standard for these adapters)
        self.ser = serial.Serial(port, 9600, timeout=1)

    def set_output(self, output, power, direction):
        """
        Adam Bryant's protocol:
        Byte 1: 0x40 | Output (0-7)
        Byte 2: Power (0-7)
        Byte 3: Direction (0=Stop, 1=Fwd, 2=Rev)
        """
        # Note: Actual hex values may vary slightly based on specific firmware versions
        cmd = bytearray([0x40 + int(output), int(power), int(direction)])
        self.ser.write(cmd)

    def get_sensor(self, port):
        # Request sensor data for specific port
        self.ser.write(bytearray([0x80 + int(port)]))
        val = self.ser.read(1)
        return ord(val) if val else 0