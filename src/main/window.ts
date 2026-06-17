import { BrowserWindow, shell } from 'electron'
import { join } from 'path'

export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#f0f4ff',
    show: false,
    title: 'zzplan - 周计划本',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
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
