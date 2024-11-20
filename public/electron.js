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

    // Define paths
    const configPath = path.join(__dirname, '../config.json');
    const imagesDirectory = path.join(__dirname, '../src/images');

    if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        mainWindow.webContents.once('dom-ready', () => {
            mainWindow.webContents.send('config-data', configData); // Send config to renderer
        });
    }

    // Listen for configuration updates
    ipcMain.on('update-config', (event, data) => {
        const { title, logoPath } = data;

        // Ensure the images directory exists
        if (!fs.existsSync(imagesDirectory)) {
            fs.mkdirSync(imagesDirectory, { recursive: true });
        }

        // Generate a unique file name for the logo
        const fileName = `logo_${Date.now()}${path.extname(logoPath)}`;
        const destination = path.join(imagesDirectory, fileName);

        // Copy the logo file to the images directory
        fs.copyFileSync(logoPath, destination);

        // Update the config with the relative path to the new logo
        const updatedConfig = {
            title,
            logoPath: `./images/${fileName}`, // Relative to `src`
        };

        // Save the updated config to `config.json`
        fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

        console.log(`Configuration saved:\nTitle: ${title}\nLogo Path: ${destination}`);

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

    const currentDirectory = path.join(__dirname, '..');

    // Start npm server
    const npmStart = spawn('cmd', ['/c', 'start', 'npm', 'start'], {
        cwd: currentDirectory,
        stdio: 'inherit',
    });

    npmStart.on('error', (err) => {
        console.error('Failed to start npm server:', err.message);
    });

    npmStart.on('close', (code) => {
        console.log(`npm server exited with code ${code}`);
    });

    // Start node server
    const nodeServer = spawn('cmd', ['/c', 'start', 'node', 'server.js'], {
        cwd: currentDirectory,
        stdio: 'inherit',
    });

    nodeServer.on('error', (err) => {
        console.error('Failed to start node server:', err.message);
    });

    nodeServer.on('close', (code) => {
        console.log(`Node server exited with code ${code}`);
    });
}
