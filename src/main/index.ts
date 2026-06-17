import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './window'
import { registerAllHandlers } from './ipc'
import { createAppMenu } from './menu'

let mainWindow: BrowserWindow | null = null

// 限制只允许单实例
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

app.whenReady().then(() => {
  // 注册所有 IPC handlers
  registerAllHandlers()

  // 创建应用菜单
  createAppMenu()

  // 创建主窗口
  mainWindow = createMainWindow()

  // macOS: 点击 dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
    }
  })
})

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
