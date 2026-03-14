# {ULI} - Universal Lego Interface.

This archive is for my Work In Progress version of Google Blockly designed to allow the reuse of older Lego computer controlled devices.
I am currently working on the lego Dacta Interface B as this has the simplest of control software to run.

# Installation instructions.
Before installation, the host computer will need to have NPM, Node.js, pyserial, pyQT6 installed along with the latest version of Python.
To install these dependenceis run Win11_install.py for windows or install_uli_pro.sh for linux.


There is a file in the source called app.py this is the background server file that handles the communication between hardware and blockly which need to be run first and so the actual starting instructions for later versions of {ULI} are as follows.

Download and extract all the files into a folder called ULI.
navigate to the src folder and run python3 main.py to start the ULI.

## Known BUGS - 

Does not work in Apple safari as it is missing the Web.serial function.

Only 1 RCX tower can be used as its hard coaded in the functions so far.

## Update 04 - March - 2026
Start of inclusion of Bliss' simple RCX python functions from - https://github.com/BlissCA/LegoRcxPy

Only 1 RCX can be used at present as the functions are hard coaded to rcx.function


## Update 01 - Febuary - 2026 

You can view and example of it running here - https://youtube.com/shorts/FvEhMnCWDJY?feature=share

## RPI Trixie installation

Download the zip file to a folder and extract the contents.
chmod the permissions of installer_uli_pro.sh
Run the file installer_uli_pro.sh
when finished run python3 main.py

This file sets up the virtual enviroment the RPI needs as well as installs the required dependencies.
