#!/bin/bash

# Define project directory
PROJECT_DIR="$HOME/ULI_Pro"
VENV_DIR="$PROJECT_DIR/venv"

echo "--- 🛠️ Starting ULI Pro Installation ---"

# 1. Version Check for Trixie
if ! grep -q "trixie" /etc/os-release; then
    echo "⚠️  WARNING: This script is optimized for RPi OS 'Trixie' (Debian 13)."
    echo "Current OS version detected:"
    grep "PRETTY_NAME" /etc/os-release
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation aborted."
        exit 1
    fi
fi

# 2. Install system dependencies (PyQt6 + WebEngine + OpenCV)
echo "--- 📦 Installing System Dependencies ---"
sudo apt update
sudo apt install -y python3-venv python3-pip python3-serial python3-pyqt6 python3-pyqt6.qtwebengine python3-opencv libqt6gui6

# 3. Create Project Directory
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# 4. Create Virtual Environment with System Access
echo "--- 🐍 Creating Virtual Environment ---"
python3 -m venv --system-site-packages "$VENV_DIR"

# 5. Update pip and install pyserial in venv
"$VENV_DIR/bin/pip" install --upgrade pip
"$VENV_DIR/bin/pip" install pyserial

# 6. Serial Port Permissions
echo "--- 🔌 Configuring Serial Permissions ---"
sudo usermod -a -G dialout $USER

# 7. Create a Desktop Launcher
echo "--- 🖥️ Creating Desktop Launcher ---"
cat <<EOF > "$HOME/Desktop/ULI_Pro.desktop"
[Desktop Entry]
Version=1.0
Type=Application
Name=ULI Pro
Comment=Lego Interface B Controller (PyQt6)
Exec=$VENV_DIR/bin/python3 $PROJECT_DIR/main.py
Icon=utilities-terminal
Terminal=true
Categories=Development;
EOF

chmod +x "$HOME/Desktop/ULI_Pro.desktop"

echo "--- ✅ Installation Complete! ---"
echo "Please log out and back in to finalize serial permissions."
echo "You can now run ULI Pro from your desktop."