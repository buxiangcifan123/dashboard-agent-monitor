// Electron preload MUST be CommonJS — use require() not import
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('dashAPI', {
  refresh: () => ipcRenderer.invoke('refresh-all'),
  getTunnelStatus: () => ipcRenderer.invoke('tunnel-status'),
  onTunnelChange: (callback) => {
    const handler = (_event, status) => callback(status)
    ipcRenderer.on('tunnel-change', handler)
    return () => ipcRenderer.removeListener('tunnel-change', handler)
  },
  reconnect: () => ipcRenderer.invoke('tunnel-reconnect'),
  setInterval: (sec) => ipcRenderer.invoke('set-interval', sec),
  getInterval: () => ipcRenderer.invoke('get-interval'),
})
