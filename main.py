import sys
import os
import serial
import serial.tools.list_ports
from PyQt6.QtWidgets import QApplication, QMainWindow
from PyQt6.QtWebEngineWidgets import QWebEngineView
from PyQt6.QtWebChannel import QWebChannel
from PyQt6.QtCore import QUrl, QObject, pyqtSlot

class Backend(QObject):
    def __init__(self):
        super().__init__()
        self.blocks_file = "saved_blocks.xml"

    @pyqtSlot(result=list)
    def get_serial_ports(self):
        ports = serial.tools.list_ports.comports()
        return [port.device for port in ports]

    @pyqtSlot(str)
    def execute_python(self, code):
        try:
            print("Executing Python Code...")
            exec(code, globals())
        except Exception as e:
            print(f"Hardware Error: {e}")

    @pyqtSlot(str)
    def save_blocks(self, xml_text):
        try:
            with open(self.blocks_file, "w") as f:
                f.write(xml_text)
        except Exception as e:
            print(f"Save Error: {e}")

    @pyqtSlot(result=str)
    def get_saved_blocks(self):
        if os.path.exists(self.blocks_file):
            with open(self.blocks_file, "r") as f:
                return f.read()
        return ""

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("{ULI} Universal Lego Interface (PyQt6)")
        self.setGeometry(100, 100, 1200, 800)

        self.browser = QWebEngineView()
        self.channel = QWebChannel()
        self.backend = Backend()
        
        # Connect the bridge
        self.channel.registerObject('backend', self.backend)
        self.browser.page().setWebChannel(self.channel)

        curr_dir = os.path.dirname(os.path.abspath(__file__))
        index_path = os.path.join(curr_dir, "index.html")
        self.browser.setUrl(QUrl.fromLocalFile(index_path))

        self.setCentralWidget(self.browser)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec()) # In PyQt6, exec_() was renamed to exec()