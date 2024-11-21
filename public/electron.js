const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs'); // Import the File System module

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,  // Security: turn off nodeIntegration
            contextIsolation: true,  // Enable context isolation for security
            preload: path.join(__dirname, 'preload.js')  // Ensure this path is correct
        },
    });

    mainWindow.loadFile(path.join(__dirname, '../config.html'));

    // Define paths
    const configPath = path.join(__dirname, '../src/config.json');
    const imagesDirectory = path.join(__dirname, '../src/images');

    if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        mainWindow.webContents.once('dom-ready', () => {
            mainWindow.webContents.send('config-data', configData); // Send config to renderer
        });
    }

    ipcMain.on('update-config', (event, data) => {
        try {
            const { title, logoPath } = data;
    
            // Check if the logoPath file exists
            if (!fs.existsSync(logoPath)) {
                event.sender.send('error', 'Logo file does not exist. Please select a valid file.');
                return;
            }
    
            // Ensure the images directory exists
            if (!fs.existsSync(imagesDirectory)) {
                fs.mkdirSync(imagesDirectory, { recursive: true });
            }
    
            // Save the logo file to the destination
            const fileName = `logo_${Date.now()}${path.extname(logoPath)}`;
            const destination = path.join(imagesDirectory, fileName);
            fs.copyFileSync(logoPath, destination);
    
            // Update the config file
            const updatedConfig = {
                title,
                logoPath: `${fileName}`,
            };
    
            fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');
            console.log(`Configuration saved:\nTitle: ${title}\nLogo Path: ${destination}`);
    
            mainWindow.close();
            startServers();
        } catch (error) {
            console.error('Error updating configuration:', error);
            event.sender.send('error', 'Failed to save configuration. Check the console for details.');
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function startServers() {
    console.log('Starting npm and node servers...');

    const currentDirectory = path.join(__dirname, '..');

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
