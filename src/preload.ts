import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from './shared/ipcChannels'

export interface ElectronAPI {
  loadWeek: (year: number, weekNumber: number) => Promise<unknown | null>
  saveWeek: (
    year: number,
    weekNumber: number,
    data: unknown
  ) => Promise<{ success: boolean; error?: string }>
  listWeeks: () => Promise<Array<{ year: number; weekNumber: number }>>
  getUserDataPath: () => Promise<string>
  getAppVersion: () => Promise<string>
  loadDeadlines: () => Promise<unknown[]>
  saveDeadlines: (data: unknown) => Promise<{ success: boolean; error?: string }>
}

contextBridge.exposeInMainWorld('electronAPI', {
  loadWeek: (year: number, weekNumber: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_LOAD_WEEK, year, weekNumber),

  saveWeek: (year: number, weekNumber: number, data: unknown) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE_WEEK, year, weekNumber, data),

  listWeeks: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_LIST_WEEKS),

  getUserDataPath: () => ipcRenderer.invoke(IPC_CHANNELS.APP_USERDATA_PATH),

  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_VERSION),

  loadDeadlines: () => ipcRenderer.invoke(IPC_CHANNELS.DEADLINES_LOAD),
  saveDeadlines: (data: unknown) =>
    ipcRenderer.invoke(IPC_CHANNELS.DEADLINES_SAVE, data),
} satisfies ElectronAPI)
