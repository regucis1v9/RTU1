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

    // Load the configuration HTML
    mainWindow.loadFile(path.join(__dirname, 'public/index.html'));

    // Listen for configuration updates
    ipcMain.on('update-config', (event, data) => {
        const configPath = path.join(__dirname, 'config.json');
        const configData = {
            title: data.title,
            logoPath: data.logoPath,
        };

        // Save configuration to a file
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
        console.log(`Konfigurācija saglabāta...\nTitle: ${data.title}\nLogo Path: ${data.logoPath}`);

        // Close the window
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

// Function to start the npm and node servers
function startServers() {
    console.log('Starting npm and node servers...');

    // Start npm server
    const npmStart = spawn('npm', ['start'], { shell: true, stdio: 'inherit' });

    npmStart.on('error', (err) => {
        console.error('Failed to start npm server:', err.message);
    });

    npmStart.on('close', (code) => {
        console.log(`npm server exited with code ${code}`);
    });

    // Start node server (adjust the file path as needed)
    const nodeServer = spawn('node', ['server.js'], { shell: true, stdio: 'inherit' });

    nodeServer.on('error', (err) => {
        console.error('Failed to start node server:', err.message);
    });

    nodeServer.on('close', (code) => {
        console.log(`Node server exited with code ${code}`);
    });
}
