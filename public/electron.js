const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createConfigWindow() {
    mainWindow = new BrowserWindow({
        width: 700,
        height: 550,
        center: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        resizable: false,
        frame: true,
        title: 'Project Configuration',
    });

    // Load the configuration HTML file
    mainWindow.loadFile(path.join(__dirname, '../config.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createConfigWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createConfigWindow();
    }
});

// Handle title and logo updates
ipcMain.on('update-config', (event, { title, logoPath }) => {
    try {
        console.log('Title:', title, 'Logo Path:', logoPath);

        // Here you can add logic to update files or configurations
        event.reply('update-config-response', { success: true });
    } catch (error) {
        event.reply('update-config-response', { success: false, error: error.message });
    }
});
