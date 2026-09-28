import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './window'
import { registerAllHandlers } from './ipc'
import { createAppMenu } from './menu'
import { agentApiService } from './services/agentApiService'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null

// 开发版使用独立身份和数据目录，避免已安装版持有单实例锁时把旧窗口拉到前台，
// 也避免两个进程同时写入同一份计划数据。
if (!app.isPackaged) {
  app.setName('zzplan-dev')
  app.setPath('userData', join(app.getPath('appData'), 'zzplan-dev'))
}

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
  void agentApiService.start(mainWindow)

  // macOS: 点击 dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createMainWindow()
      agentApiService.setMainWindow(mainWindow)
    }
  })
})

app.on('before-quit', () => {
  agentApiService.stop()
})

// 所有窗口关闭时退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
