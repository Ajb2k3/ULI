import time

class InterfaceB:
    def __init__(self):
        self.ser = None

    def read_raw_packet(self):
        if self.ser and self.ser.is_open:
            self.ser.write(b'\x02')
            # Exact read from your working script
            return self.ser.read(19)
        return b'\x00' * 19

    def initialise(self):
        return "Initialised"