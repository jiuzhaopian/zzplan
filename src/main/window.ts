import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { IPC_CHANNELS } from '../shared/ipcChannels'

export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#f0f4ff',
    show: false,
    title: app.isPackaged ? 'zzplan - 周计划本' : 'zzplan 开发版 - 周计划本',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  let readyToClose = false
  let closeGuardReady = false
  const handleCloseGuardReady = (event: Electron.IpcMainEvent) => {
    if (event.sender === mainWindow.webContents) closeGuardReady = true
  }
  const handleReadyToClose = (event: Electron.IpcMainEvent) => {
    if (event.sender !== mainWindow.webContents) return
    readyToClose = true
    mainWindow.close()
  }

  ipcMain.on(IPC_CHANNELS.APP_CLOSE_GUARD_READY, handleCloseGuardReady)
  ipcMain.on(IPC_CHANNELS.APP_READY_TO_CLOSE, handleReadyToClose)

  mainWindow.on('close', (event) => {
    if (readyToClose || !closeGuardReady || mainWindow.webContents.isDestroyed()) {
      return
    }
    event.preventDefault()
    mainWindow.webContents.send(IPC_CHANNELS.APP_BEFORE_CLOSE)
  })

  mainWindow.webContents.on('render-process-gone', () => {
    closeGuardReady = false
  })

  mainWindow.on('closed', () => {
    ipcMain.removeListener(IPC_CHANNELS.APP_CLOSE_GUARD_READY, handleCloseGuardReady)
    ipcMain.removeListener(IPC_CHANNELS.APP_READY_TO_CLOSE, handleReadyToClose)
  })

  // 防止外部链接在窗口中打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // ready-to-show 后再显示窗口，防止白屏闪烁
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 开发环境加载 Vite dev server，生产环境加载打包文件
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  return mainWindow
}
