const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the configuration HTML initially
    mainWindow.loadFile(path.join(__dirname, '../config.html'));

    // Read config.json on app load and send to renderer (React)
    const configPath = path.join(__dirname, '../config.json');
    if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        mainWindow.webContents.once('dom-ready', () => {
            mainWindow.webContents.send('config-data', configData);
        });
    }

    // Listen for configuration updates (e.g., title and logo)
    ipcMain.on('update-config', (event, data) => {
        const configData = {
            title: data.title,
            logoPath: data.logoPath,
        };
        // Save the updated config to config.json
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
        console.log(`Konfigurācija saglabāta...\nTitle: ${data.title}\nLogo Path: ${data.logoPath}`);
        
        // Close the configuration window
        mainWindow.close();
        
        // Start npm and node servers
        startServers();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Function to start npm and node servers
function startServers() {
    console.log('Starting npm and node servers...');
    
    // Get the current directory where this Electron app is located
    const currentDirectory = path.join(__dirname, '..');

    // Function to create a new Terminal window and run a command
    function runInNewTerminal(command) {
        const script = `
            tell application "Terminal"
                do script "cd ${currentDirectory} && ${command}"
                activate
            end tell
        `;
        
        const osascript = spawn('osascript', ['-e', script]);
        
        osascript.stderr.on('data', (data) => {
            console.error(`Error running command: ${data}`);
        });
        
        return osascript;
    }

    // Start npm server in a new Terminal window
    const npmProcess = runInNewTerminal('npm start');
    npmProcess.on('error', (err) => {
        console.error('Failed to start npm server:', err.message);
    });

    // Start node server in a new Terminal window
    const nodeProcess = runInNewTerminal('node server.js');
    nodeProcess.on('error', (err) => {
        console.error('Failed to start node server:', err.message);
    });
    
    // Optional: Create a monitoring function
    function monitorProcess(process, name) {
        process.stdout?.on('data', (data) => {
            console.log(`${name} output: ${data}`);
        });
        
        process.stderr?.on('data', (data) => {
            console.error(`${name} error: ${data}`);
        });
        
        process.on('close', (code) => {
            console.log(`${name} exited with code ${code}`);
        });
    }

    // Monitor both processes
    monitorProcess(npmProcess, 'NPM Server');
    monitorProcess(nodeProcess, 'Node Server');

    // Optional: Add error handling for the main process
    process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
}

// Optional: Add graceful shutdown handling
let isShuttingDown = false;

function gracefulShutdown() {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('Shutting down gracefully...');
    
    // Close the main window if it exists
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.close();
    }

    // Kill any running processes
    const killCommand = spawn('pkill', ['-f', 'node']);
    killCommand.on('close', () => {
        app.quit();
    });
}

// Listen for shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
