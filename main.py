import sys
import os
import time
import serial
from PyQt6.QtWidgets import QApplication, QMainWindow
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebChannel import QWebChannel
from PyQt6.QtCore import QUrl, pyqtSlot, QObject, QThread, pyqtSignal

from interface_b import InterfaceB

class ScriptWorker(QThread):
    finished = pyqtSignal()
    error = pyqtSignal(str)
    # New signal to carry print messages back to the bridge
    log_signal = pyqtSignal(str)

    def __init__(self, code, robot):
        super().__init__()
        self.code = code
        self.robot = robot

    def run(self):
        try:
            # Prepare the environment for the Blockly code
            exec_globals = {
                'interface': self.robot,
                'time': time,
                'serial': serial,
                # Crucial: print now sends data through the signal
                'print': lambda msg: self.log_signal.emit(str(msg))
            }
            
            time.sleep(0.1)
            exec(self.code, exec_globals)
        except Exception as e:
            self.error.emit(str(e))
        finally:
            self.finished.emit()

class Bridge(QObject):
    # This signal is the "Safe Passage" for text from the worker to the UI
    ui_log_requested = pyqtSignal(str)

    def __init__(self, robot, browser_page):
        super().__init__()
        self.robot = robot
        self.browser_page = browser_page
        self.worker = None
        # Connect the internal signal to the actual UI updater
        self.ui_log_requested.connect(self._do_web_log)

    def _do_web_log(self, message):
        """This function now safely runs on the MAIN THREAD."""
        safe_msg = repr(str(message))
        self.browser_page.runJavaScript(f"window.logToConsole({safe_msg});")

    @pyqtSlot(str)
    def execute_python(self, code):
        if self.worker and self.worker.isRunning():
            return

        # Initialize the worker
        self.worker = ScriptWorker(code, self.robot)
        
        # Connect worker signals to the bridge
        self.worker.log_signal.connect(self.ui_log_requested.emit)
        self.worker.error.connect(lambda err: self.ui_log_requested.emit(f"System Error: {err}"))
        
        self.worker.start()

class AppWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("{ULI} Controller")
        self.resize(1100, 850)
        self.robot = InterfaceB()
        self.browser = QWebEngineView()
        self.channel = QWebChannel()
        self.bridge = Bridge(self.robot, self.browser.page())
        self.channel.registerObject("backend", self.bridge)
        self.browser.page().setWebChannel(self.channel)
        
        basedir = os.path.dirname(os.path.abspath(__file__))
        self.browser.setUrl(QUrl.fromLocalFile(os.path.join(basedir, "index.html")))
        self.setCentralWidget(self.browser)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = AppWindow()
    window.show()
    sys.exit(app.exec())