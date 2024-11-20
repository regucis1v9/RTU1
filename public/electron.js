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
            preload: path.join(__dirname, 'preload.js'), // Load the preload script
            contextIsolation: true, // Enable context isolation
            nodeIntegration: false, // Disable nodeIntegration for security
        },
    });

    // Load the configuration HTML initially
    mainWindow.loadFile(path.join(__dirname, '../config.html'));
    const configPath = path.join(__dirname, '../config.json');
    const imagesDirectory = path.join(__dirname, '../src/images');

    if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        mainWindow.webContents.once('dom-ready', () => {
            mainWindow.webContents.send('config-data', configData);  // Send config to renderer
        });
    }

    ipcMain.on('request-config', (event) => {
        const configPath = path.join(__dirname, '../config.json');
        if (fs.existsSync(configPath)) {
            const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            event.sender.send('config-data', configData);
            console.log('Sent config data:', configData); // Debug log
        } else {
            console.error('Config file not found at:', configPath);
        }
    });

    // Listen for configuration updates (e.g., title and logo)
    ipcMain.on('update-config', (event, data) => {
        const { title, logo } = data;
    
        if (!fs.existsSync(imagesDirectory)) {
            fs.mkdirSync(imagesDirectory, { recursive: true }); // Ensure the images folder exists
        }
    
        const base64Data = logo.data.replace(/^data:image\/\w+;base64,/, '');
        const filePath = path.join(imagesDirectory, logo.name);
    
        // Save the image file
        fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
    
        // Update the config JSON with the new logo path
        const configData = {
            title: title,
            logoPath: `/images/${logo.name}`, // Path relative to React's public folder
        };
    
        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
        console.log(`Configuration saved:\nTitle: ${title}\nLogo Path: ${filePath}`);
    
        // Close the configuration window
        mainWindow.close();
    
        // Optionally start servers
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