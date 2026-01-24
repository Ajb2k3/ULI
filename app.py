from flask import Flask, request, jsonify
from flask_cors import CORS
import time

# IMPORT YOUR HARDWARE DRIVER HERE
# e.g., import interface_b_driver as iface

app = Flask(__name__)
CORS(app) # Allows your browser to talk to this server

@app.route('/run', methods=['POST'])
def run_code():
    data = request.json
    code = data.get('code', '')
    
    print("--- Executing Received Code ---")
    print(code)
    
    try:
        # This is where the magic happens. 
        # exec() runs the string as actual Python code.
        exec(code)
        return jsonify({"status": "success", "message": "Code executed"})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/stop', methods=['POST'])
def stop_all():
    print("Emergency Stop!")
    # iface.stop_all() 
    return jsonify({"status": "stopped"})

if __name__ == '__main__':
    app.run(port=5000, debug=True)