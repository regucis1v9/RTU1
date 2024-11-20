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
        mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
    }

    // Read and send config when requested
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

    // Handle config updates
    ipcMain.on('update-config', (event, data) => {
        const configPath = path.join(__dirname, '../config.json');
        try {
            fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8');
            console.log('Configuration saved:', data);
            startServers(); // Start the servers after saving config
        } catch (error) {
            console.error('Error saving config:', error);
        }
    });
}

// Create window when app is ready
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

// Function to start servers programmatically
function startServers() {
    console.log('Starting npm and node servers programmatically...');
    const currentDirectory = path.join(__dirname, '..'); // Adjust if needed

    // Define the paths to npm and node binaries if needed
    const npmPath = '/usr/local/bin/npm'; // Adjust to your npm binary path
    const nodePath = '/usr/local/bin/node'; // Adjust to your node binary path

    const npmProcess = spawn(npmPath, ['start'], { cwd: currentDirectory });
    const nodeProcess = spawn(nodePath, ['server.js'], { cwd: currentDirectory });

    const processes = [
        { process: npmProcess, name: 'NPM Server' },
        { process: nodeProcess, name: 'Node Server' },
    ];

    processes.forEach(({ process, name }) => {
        process.stdout?.on('data', (data) => {
            console.log(`${name} output: ${data.toString()}`);
        });

        process.stderr?.on('data', (data) => {
            console.error(`${name} error: ${data.toString()}`);
        });

        process.on('close', (code) => {
            console.log(`${name} exited with code ${code}`);
            if (code !== 0) {
                console.error(`${name} encountered an issue.`);
            }
        });

        process.on('error', (err) => {
            console.error(`Failed to start ${name}:`, err.message);
        });
    });
}

// Graceful shutdown handling
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
