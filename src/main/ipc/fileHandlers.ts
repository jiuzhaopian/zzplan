import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipcChannels'
import { fileService } from '../services/fileService'

export function registerFileHandlers(): void {
  ipcMain.handle(
    IPC_CHANNELS.FILE_LOAD_WEEK,
    async (_event, year: number, weekNumber: number) => {
      try {
        const data = await fileService.loadWeek(year, weekNumber)
        return data
      } catch (error) {
        console.error('[IPC] loadWeek 失败:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    IPC_CHANNELS.FILE_SAVE_WEEK,
    async (_event, year: number, weekNumber: number, data: unknown) => {
      try {
        await fileService.saveWeek(year, weekNumber, data)
        return { success: true }
      } catch (error) {
        console.error('[IPC] saveWeek 失败:', error)
        return {
          success: false,
          error: (error as Error).message,
        }
      }
    }
  )

  ipcMain.handle(IPC_CHANNELS.FILE_LIST_WEEKS, async () => {
    try {
      return await fileService.listWeeks()
    } catch (error) {
      console.error('[IPC] listWeeks 失败:', error)
      return []
    }
  })

  ipcMain.handle(IPC_CHANNELS.APP_USERDATA_PATH, async () => {
    return fileService.getUserDataPath()
  })

  ipcMain.handle(IPC_CHANNELS.APP_VERSION, async () => {
    return process.env.npm_package_version || '1.0.0'
  })

  // 全局 DDL
  ipcMain.handle(IPC_CHANNELS.DEADLINES_LOAD, async () => {
    return await fileService.loadDeadlines()
  })

  ipcMain.handle(IPC_CHANNELS.DEADLINES_SAVE, async (_event, data: unknown) => {
    try {
      await fileService.saveDeadlines(data)
      return { success: true }
    } catch (error) {
      console.error('[IPC] saveDeadlines 失败:', error)
      return { success: false, error: (error as Error).message }
    }
  })
}
