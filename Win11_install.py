import subprocess
import sys
import os

def run_command(command, shell=True):
    """Utility to run a command and print output."""
    print(f"Executing: {command}")
    try:
        subprocess.check_call(command, shell=shell)
    except subprocess.CalledProcessError as e:
        print(f"Error executing {command}: {e}")

def install_system_apps():
    """Install Python, Node.js (which includes npm) via Winget."""
    print("--- Installing System Applications ---")
    
    # Install Python 3 (latest)
    # Using winget ensures it's added to PATH automatically
    run_command("winget install -e --id Python.Python.3")

    # Install Node.js (Latest LTS) - This includes npm
    run_command("winget install -e --id OpenJS.NodeJS.LTS")

def install_python_packages():
    """Install Python libraries via pip."""
    print("\n--- Installing Python Packages ---")
    
    packages = [
        "PyQt6",     # Latest version of PyQt
        "pyserial",  # For serial communication
        "pyusb"      # For USB communication
    ]
    
    for package in packages:
        run_command(f"{sys.executable} -m pip install --upgrade {package}")

def main():
    # Check for Admin privileges (required for winget installs)
    print("Starting ULI Dependency Installer...")
    
    # 1. Install System Tools (Python/Node/NPM)
    install_system_apps()
    
    # 2. Refresh environment variables (simulated)
    print("Note: If this is the first time installing Python/Node, you may need to restart your terminal.")
    
    # 3. Install Python Libraries
    install_python_packages()
    
    print("\nInstallation Complete!")
    print("Verified versions:")
    run_command("python --version")
    run_command("node -v")
    run_command("npm -v")

if __name__ == "__main__":
    main()