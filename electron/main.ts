import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { collectAll } from './collectors'
import { startTunnel, reconnectTunnel, getTunnelStatus, onTunnelChange, stopTunnel } from './tunnel'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let win: BrowserWindow | null = null
let tray: Tray | null = null
let intervalSec = 60

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#0f172a',
    title: 'Agent Monitor',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (!app.isPackaged && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.on('closed', () => { win = null })
}

function createTray() {
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  tray.setToolTip('Agent Monitor')
  const menu = Menu.buildFromTemplate([
    { label: '显示面板', click: () => showPanel() },
    { label: '立即刷新', click: () => { collectAll().then((s) => win?.webContents?.send('snapshot', s)).catch(() => {}) } },
    { label: '重连隧道', click: () => reconnectTunnel() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() },
  ])
  tray.setContextMenu(menu)
  tray.on('double-click', () => showPanel())
}

function showPanel() {
  if (!win || win.isDestroyed()) {
    createWindow()
  } else {
    win.show()
    win.focus()
  }
}

async function collectAndPush() {
  try {
    const snapshot = await collectAll()
    win?.webContents?.send('snapshot', snapshot)
  } catch (e: any) {
    console.error('[refresh] failed:', e)
  }
}

ipcMain.handle('refresh-all', async () => collectAll())
ipcMain.handle('tunnel-status', () => getTunnelStatus())
ipcMain.handle('tunnel-reconnect', () => { reconnectTunnel() })
ipcMain.handle('set-interval', (_e, sec: number) => { intervalSec = sec })
ipcMain.handle('get-interval', () => intervalSec)

app.whenReady().then(() => {
  createWindow()
  createTray()
  onTunnelChange((s) => { win?.webContents?.send('tunnel-change', s) })
  startTunnel()
  collectAndPush()
})

app.on('window-all-closed', () => { /* 留托盘,不退出 */ })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
app.on('before-quit', () => { stopTunnel() })
