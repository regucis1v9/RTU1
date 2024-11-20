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
            nodeIntegration: true, // Enable node integration
            contextIsolation: false, // Disable context isolation
        },
    });

    // Load the HTML file
    mainWindow.loadFile(path.join(__dirname, 'config.html'));

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Handle configuration update
ipcMain.on('update-config', (event, data) => {
    const configPath = path.join(__dirname, 'config.json');
    try {
        fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log('Configuration saved:', data);

        // Start servers
        startServers();
    } catch (error) {
        console.error('Error saving configuration:', error);
        event.reply('update-failed', 'Failed to save configuration.');
    }
});

// Function to start npm and node servers
function startServers() {
    console.log('Starting servers...');
    const projectPath = path.join(__dirname); // Adjust this if your server files are elsewhere

    // Define paths to executables (adjust as needed)
    const npmPath = 'npm'; // Use system npm, or provide full path if necessary
    const nodePath = 'node'; // Use system node, or provide full path if necessary

    // Start npm server
    const npmProcess = spawn(npmPath, ['start'], { cwd: projectPath });
    npmProcess.stdout.on('data', (data) => console.log(`NPM: ${data}`));
    npmProcess.stderr.on('data', (data) => console.error(`NPM Error: ${data}`));

    // Start node server
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
