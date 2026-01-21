from flask import Flask, render_template_string, request, jsonify
import serial
import time
import threading

app = Flask(__name__)

# Adam Bryant's Interface B Wrapper
class InterfaceB:
    def __init__(self, port='/dev/ttyUSB0'):
        try:
            self.ser = serial.Serial(port, 9600, timeout=1)
            print(f"Connected to Interface B on {port}")
        except Exception as e:
            print(f"Connection Error: {e}")
            self.ser = None

    def set_output(self, output, power, direction):
        if self.ser:
            # Protocol: 0x40 + port, then power, then direction
            cmd = bytearray([0x40 + int(output), int(power), int(direction)])
            self.ser.write(cmd)

    def get_sensor(self, port):
        if self.ser:
            self.ser.write(bytearray([0x80 + int(port)]))
            val = self.ser.read(1)
            return ord(val) if val else 0
        return 0
    def stop_all(self):
    if self.ser:
        for i in range(8):
            self.set_output(i, 0, 0)
        print("Emergency Stop: All outputs cleared.")

# Global instance
iface = None


@app.route('/stop', methods=['POST'])
def stop_immediately():
    global iface
    if iface:
        iface.stop_all()
    return jsonify({"status": "Stopped"})
@app.route('/')
def index():
    # Return the HTML code provided in the previous step here
    return open('index.html').read()

@app.route('/run', methods=['POST'])
def run_code():
    global iface
    data = request.get_json()
    code = data.get('code', '')
    
    # We define a function to run the code so we don't block the server
    def execute_user_code(user_code):
        global iface
        try:
            # The context for exec includes our iface and time module
            exec_globals = {'iface': iface, 'time': time, 'InterfaceB': InterfaceB}
            exec(user_code, exec_globals)
        except Exception as e:
            print(f"Execution error: {e}")

    thread = threading.Thread(target=execute_user_code, args=(code,))
    thread.start()
    return jsonify({"status": "Started"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)