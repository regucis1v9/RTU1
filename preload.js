const { contextBridge, ipcRenderer } = require('electron');

// Expose the IPC renderer to the React app, safely
contextBridge.exposeInMainWorld('electron', {
  getConfig: () => ipcRenderer.invoke('get-config'), // Safe method to get config data
  updateConfig: (config) => ipcRenderer.send('update-config', config), // Send updated config
  onConfigData: (callback) => ipcRenderer.on('config-data', callback), // Listen for config updates
});