import sys
import os
import serial
import serial.tools.list_ports
import json
import threading
import time
from PyQt6.QtWidgets import QApplication, QMainWindow
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebChannel import QWebChannel
from PyQt6.QtCore import QUrl, QObject, pyqtSlot, pyqtSignal as signal, Qt


# ==========================================
# PYTHON HARDWARE API 
# ==========================================

def interface_b_init(name, port):
    print(f"DEBUG: Initializing Interface B [{name}] on {port}")

def rcx_init(name, port):
    print(f"DEBUG: Initializing LEGO RCX [{name}] on {port}")

def rcx_sensor_init(iface_name, port, sensor_type):
    print(f"DEBUG: {iface_name} sensor on Port {port} set to {sensor_type}")

def text_print(msg):
    print(str(msg))

# ==========================================
class WorkerSignals(QObject):
    request_js = signal(str)


class ConsoleRedirector(QObject):
    def __init__(self, signals_instance): # Pass signals here, not the browser
        super().__init__()
        self.signals = signals_instance

    def write(self, message):
        if message.strip():
            # Escape for JS string safety
            safe_msg = message.replace("\\", "\\\\").replace("'", "\\'").replace("\n", " ")
        
            # Wrap the entire script in { } to create a local scope
            js_code = (
                "{" 
               "  let cp = document.getElementById('consolePanel'); "
                f"  if(cp) {{ cp.innerText += '{safe_msg}\\n'; cp.scrollTop = cp.scrollHeight; }} "
                "}"
            )
            self.signals.request_js.emit(js_code)

    def flush(self):
        pass

class Backend(QObject):
    def __init__(self, browser_widget):
        super().__init__()
        self.browser = browser_widget
        self.running = False

    @pyqtSlot(result=list)
    def get_serial_ports(self):
        return [str(port.device) for port in serial.tools.list_ports.comports()]

    @pyqtSlot(str, str)
    def run_with_cleanup(self, ui_mapping_json, code):
        # Stop any currently running thread
        self.running = False 
        time.sleep(0.2) 
        
        # Clear the UI console
        # Use a block to avoid 'cp' redeclaration errors
        # Line 75 should look exactly like this:
        self.browser.page().runJavaScript("{ let cp = document.getElementById('consolePanel'); if(cp) cp.innerText = ''; }")

        print("--- STARTING BACKGROUND SESSION ---")
        self.running = True 
        
        def worker():
            try:
                if 'ifaces' not in globals():
                    globals()['ifaces'] = {}
                # Execute the code from Blockly
                exec(code, globals())
                window.signals.request_js.emit("console.log('Session Complete');")
            except Exception as e:
                print(f"HARDWARE ERROR: {e}")
            finally:
                self.running = False

        thread = threading.Thread(target=worker)
        thread.daemon = True
        thread.start()

    @pyqtSlot()
    def stop_all(self):
        self.running = False
        print("--- EMERGENCY STOP ---")
        if 'ifaces' in globals():
            for name, data in globals()['ifaces'].items():
                try: 
                    if data and 'ser' in data:
                        data['ser'].close()
                except: pass
            globals()['ifaces'] = {}

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("{ULI} Universal Lego Interface")
        self.setGeometry(100, 100, 1200, 800)

        # 1. Setup UI
        self.browser = QWebEngineView()
        self.setCentralWidget(self.browser)

        # 2. Setup Signals (Crucial for thread safety)
        self.signals = WorkerSignals()
        self.signals.request_js.connect(self.browser.page().runJavaScript)

        # 3. Setup Backend
        self.backend = Backend(self.browser)
        # Pass the signals to the backend so the worker thread can use them
        self.backend.signals = self.signals 

        # 4. Setup WebChannel
        self.channel = QWebChannel()
        self.channel.registerObject('backend', self.backend)
        self.browser.page().setWebChannel(self.channel)

        # 5. Setup Redirector (ONLY ONCE)
        # Ensure we pass the signals instance
        self.redirector = ConsoleRedirector(self.signals)
        sys.stdout = self.redirector
        sys.stderr = self.redirector

        # 6. Load Page
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        index_path = os.path.join(curr_dir, "index.html")
        self.browser.setUrl(QUrl.fromLocalFile(index_path))

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())