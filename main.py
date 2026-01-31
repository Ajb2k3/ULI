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

    def __init__(self, code, exec_globals):
        super().__init__()
        self.code = code
        self.exec_globals = exec_globals

    def run(self):
        try:
            # We add a tiny delay to let the UI thread breathe
            time.sleep(0.1)
            exec(self.code, self.exec_globals)
        except Exception as e:
            self.error.emit(str(e))
        finally:
            self.finished.emit()

class Bridge(QObject):
    def __init__(self, robot, browser_page):
        super().__init__()
        self.robot = robot
        self.browser_page = browser_page
        self.worker = None

    def log_to_web(self, message):
        safe_msg = repr(str(message))
        self.browser_page.runJavaScript(f"window.logToConsole({safe_msg});")

    @pyqtSlot(str)
    def execute_python(self, code):
        if self.worker and self.worker.isRunning():
            return

        exec_globals = {
            'interface': self.robot,
            'time': time,
            'serial': serial,
            'print': self.log_to_web
        }
        
        self.worker = ScriptWorker(code, exec_globals)
        self.worker.error.connect(lambda err: self.log_to_web(f"System Error: {err}"))
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