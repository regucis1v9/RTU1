const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process'); // Add this import

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        resizable: false, // Prevent window resizing
        maximizable: false, // Prevent maximizing
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, '../config.html'));

    const configPath = path.join(__dirname, '../src/config.json');
    const imagesDirectory = path.join(__dirname, '../src/images');

    if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        mainWindow.webContents.once('dom-ready', () => {
            mainWindow.webContents.send('config-data', configData);
        });
    }

    ipcMain.on('update-config', (event, data) => {
        try {
            const { title, logoPath } = data;
    
            if (!fs.existsSync(logoPath)) {
                event.sender.send('error', 'Logo file does not exist. Please select a valid file.');
                return;
            }
    
            if (!fs.existsSync(imagesDirectory)) {
                fs.mkdirSync(imagesDirectory, { recursive: true });
            }
    
            const fileName = `logo_${Date.now()}${path.extname(logoPath)}`;
            const destination = path.join(imagesDirectory, fileName);
            fs.copyFileSync(logoPath, destination);
    
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
    
    // Determine the correct command based on platform
    const isWindows = process.platform === 'win32';
    const npmCommand = isWindows ? 'cmd' : 'npm';
    const npmArgs = isWindows ? ['/c', 'start', 'npm', 'start'] : ['start'];
    
    const nodeCommand = isWindows ? 'cmd' : 'node';
    const nodeArgs = isWindows ? ['/c', 'start', 'node', 'server.js'] : ['server.js'];

    const npmStart = spawn(npmCommand, npmArgs, {
        cwd: currentDirectory,
        shell: !isWindows, // Use shell for non-Windows platforms
        stdio: 'inherit',
    });

    npmStart.on('error', (err) => {
        console.error('Failed to start npm server:', err.message);
    });

    npmStart.on('close', (code) => {
        console.log(`npm server exited with code ${code}`);
    });

    const nodeServer = spawn(nodeCommand, nodeArgs, {
        cwd: currentDirectory,
        shell: !isWindows, // Use shell for non-Windows platforms
        stdio: 'inherit',
    });

    nodeServer.on('error', (err) => {
        console.error('Failed to start node server:', err.message);
    });

    nodeServer.on('close', (code) => {
        console.log(`Node server exited with code ${code}`);
    });
}