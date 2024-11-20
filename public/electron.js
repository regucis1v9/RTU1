const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load config.html from the root folder
    mainWindow.loadFile(path.join(__dirname, '../config.html'));

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Handle configuration update
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


// Function to start npm and node servers
function startServers() {
    console.log('Starting servers...');
    const projectPath = path.join(__dirname, '..');

    const npmPath = 'npm';
    const nodePath = 'node';

    const npmProcess = spawn(npmPath, ['start'], { cwd: projectPath });
    npmProcess.stdout.on('data', (data) => console.log(`NPM: ${data}`));
    npmProcess.stderr.on('data', (data) => console.error(`NPM Error: ${data}`));

    const nodeProcess = spawn(nodePath, ['server.js'], { cwd: projectPath });
    nodeProcess.stdout.on('data', (data) => console.log(`Node: ${data}`));
    nodeProcess.stderr.on('data', (data) => console.error(`Node Error: ${data}`));

    npmProcess.on('close', (code) => console.log(`NPM exited with code ${code}`));
    nodeProcess.on('close', (code) => console.log(`Node exited with code ${code}`));
}

// App lifecycle events
app.whenReady().then(createWindow);

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

process.on('SIGTERM', () => app.quit());
process.on('SIGINT', () => app.quit());
