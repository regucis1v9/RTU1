const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../config.html'));
    }

    // Handle "request-config" to read from config.json
    ipcMain.on('request-config', (event) => {
        const configPath = path.join(__dirname, '../config.json');
        try {
            if (fs.existsSync(configPath)) {
                const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                event.reply('config-data', configData);
            } else {
                event.reply('config-data', { title: 'Default Title', logoPath: '/default-logo.png' });
            }
        } catch (error) {
            console.error('Error reading config:', error);
            event.reply('config-data', { title: 'Default Title', logoPath: '/default-logo.png' });
        }
    });

    // Handle "update-config" to save to config.json and start servers
    ipcMain.on('update-config', (event, data) => {
        const configPath = path.join(__dirname, '../config.json');
        try {
            fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8');
            console.log('Configuration saved:', data);

            // Start servers
            startServers();
        } catch (error) {
            console.error('Error saving config:', error);
        }
    });
}

// Create the main window
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Function to start npm and node servers in new terminals
function startServers() {
    console.log('Starting npm and node servers in new terminals...');
    const projectDir = path.join(__dirname, '..');

    // Update paths to npm and node binaries if required
    const npmPath = '/usr/local/bin/npm'; // Adjust to your system
    const nodePath = '/usr/local/bin/node'; // Adjust to your system

    function runInTerminal(command) {
        const script = `
            tell application "Terminal"
                do script "cd ${projectDir} && ${command}"
                activate
            end tell
        `;

        const osascript = spawn('osascript', ['-e', script]);
        osascript.stderr.on('data', (data) => {
            console.error(`Error running command: ${data}`);
        });
    }

    // Run npm start and node server.js
    runInTerminal(`${npmPath} start`);
    runInTerminal(`${nodePath} server.js`);
}

// Graceful shutdown
let isShuttingDown = false;

function gracefulShutdown() {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('Shutting down gracefully...');

    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.close();
    }

    const killCommand = spawn('pkill', ['-f', 'node']);
    killCommand.on('close', () => {
        app.quit();
    });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
