const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
      send: (channel, ...args) => ipcRenderer.send(channel, ...args),
      on: (channel, listener) => {
        console.log(`Listening for ${channel}`);
        ipcRenderer.on(channel, (event, ...args) => {
          console.log(`Event received on ${channel}:`, args);
          listener(event, ...args);
        });
      },
      removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    },
  });