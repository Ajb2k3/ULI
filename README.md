{ULI} - Universal Lego Interface.

This archive is for my Work In Progress version of Google Blockly designed to allow the reuse of older Lego computer controlled devices.
I am currently working on the lego Dacta Interface B as this has the simplest of control software to run.



Installation instructions.
Before installation, the host computer will need to have NPM and Node.js installed along with the latest version of Python.

Step 1 - Create a workfolder on the host computer that will contain the Blockly Source code and {ULI} source code.
Step 2A - To create a javascript blockly project use npx @blockly/create-package app ULI
Step 2B - To create a Typescript Blockly project use npx @blockly/create-package app ULI --typescript
Step 3 - Using the command line cd into the directory /hostfolder/ULI/
Step 4 - Run npm run start to start the {ULI}

The above instruction are taken from the Google blockly guide but for {ULI} to work and communicate with hardware it need to have flask installed using the following commands
pip3 install flask
pip3 install flask flask-cors

There is a file in the source called app.py this is the background server file that handles the communication between hardware and blockly which need to be run first and so the actual starting instructions for later versions of {ULI} are as follows.

Step 1 - Create a workfolder on the host computer that will contain the Blockly Source code and {ULI} source code.
Step 2A - To create a javascript blockly project use: npx @blockly/create-package app ULI
Step 2B - To create a Typescript Blockly project use: npx @blockly/create-package app ULI --typescript
Step 3 - Using the command line cd into the directory /hostfolder/ULI/
Step 4 - Run the background server with :python3 app.py
Step 5 - To Run {ULI} use the command: npm run start 

This will run {ULI} in the defalut web browser, for OSX this is safari which has security issues stopping the code from accessing the USB ports.
