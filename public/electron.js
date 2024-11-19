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
            nodeIntegration: false, // Disable nodeIntegration for security
            contextIsolation: true, // Enable contextIsolation for security
            preload: path.join(__dirname, 'preload.js'), // Load the preload.js to expose safe APIs
        },
    });

    // Load the configuration HTML initially
    mainWindow.loadFile(path.join(__dirname, '../config.html'));

    // Send the config data to the renderer process when it's ready
    const configPath = path.join(__dirname, '../config.json');
    if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        mainWindow.webContents.once('dom-ready', () => {
            mainWindow.webContents.send('config-data', configData); // Send the config data to the renderer
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

// Function to start npm and node servers in separate terminals
function startServers() {
    console.log('Starting npm and node servers...');

    // Get the current directory where this Electron app is located
    const currentDirectory = path.join(__dirname, '..');

    // Start npm server in a new Command Prompt window
    const npmStart = spawn('cmd', ['/c', 'start', 'npm', 'start'], {
        cwd: currentDirectory, // Set the working directory
        stdio: 'inherit', // Inherit stdio so that logs are shown in the terminal
    });

    npmStart.on('error', (err) => {
        console.error('Failed to start npm server:', err.message);
    });

    npmStart.on('close', (code) => {
        console.log(`npm server exited with code ${code}`);
    });

    // Start node server in a new Command Prompt window (adjust the file path as needed)
    const nodeServer = spawn('cmd', ['/c', 'start', 'node', 'server.js'], {
        cwd: currentDirectory, // Set the working directory for node server
        stdio: 'inherit',
    });

    nodeServer.on('error', (err) => {
        console.error('Failed to start node server:', err.message);
    });

    nodeServer.on('close', (code) => {
        console.log(`Node server exited with code ${code}`);
    });
}
