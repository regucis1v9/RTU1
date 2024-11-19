const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createConfigWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 400,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false,
        frame: true,
        title: 'Project Configuration'
    });

    // Load the configuration HTML file
    win.loadFile('config.html');
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
    // Your existing update logic here
    // This will handle the file operations
});