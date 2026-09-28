import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from './shared/ipcChannels'
import type {
  AgentApiInfo,
  AgentImportRequest,
  AgentImportStatus,
  PlanBatchWritePayload,
} from './shared/planImport'

export interface ElectronAPI {
  loadWeek: (year: number, weekNumber: number) => Promise<unknown | null>
  saveWeek: (
    year: number,
    weekNumber: number,
    data: unknown
  ) => Promise<{ success: boolean; error?: string }>
  savePlanBatch: (payload: PlanBatchWritePayload) => Promise<{ success: boolean; error?: string }>
  listWeeks: () => Promise<Array<{ year: number; weekNumber: number }>>
  getUserDataPath: () => Promise<string>
  getAppVersion: () => Promise<string>
  loadDeadlines: () => Promise<unknown[]>
  saveDeadlines: (data: unknown) => Promise<{ success: boolean; error?: string }>
  onSaveRequested: (callback: () => void) => () => void
  onBeforeClose: (callback: () => void) => () => void
  signalCloseGuardReady: () => void
  signalReadyToClose: () => void
  getAgentApiInfo: () => Promise<AgentApiInfo>
  listPendingAgentImports: () => Promise<AgentImportRequest[]>
  onAgentImportRequested: (callback: (request: AgentImportRequest) => void) => () => void
  resolveAgentImport: (
    id: string,
    status: Exclude<AgentImportStatus, 'pending'>,
    result?: unknown
  ) => Promise<boolean>
}

contextBridge.exposeInMainWorld('electronAPI', {
  loadWeek: (year: number, weekNumber: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_LOAD_WEEK, year, weekNumber),

  saveWeek: (year: number, weekNumber: number, data: unknown) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE_WEEK, year, weekNumber, data),

  savePlanBatch: (payload: PlanBatchWritePayload) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE_PLAN_BATCH, payload),

  listWeeks: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_LIST_WEEKS),

  getUserDataPath: () => ipcRenderer.invoke(IPC_CHANNELS.APP_USERDATA_PATH),

  getAppVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_VERSION),

  loadDeadlines: () => ipcRenderer.invoke(IPC_CHANNELS.DEADLINES_LOAD),
  saveDeadlines: (data: unknown) =>
    ipcRenderer.invoke(IPC_CHANNELS.DEADLINES_SAVE, data),

  onSaveRequested: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on(IPC_CHANNELS.APP_SAVE_REQUESTED, listener)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.APP_SAVE_REQUESTED, listener)
  },

  onBeforeClose: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on(IPC_CHANNELS.APP_BEFORE_CLOSE, listener)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.APP_BEFORE_CLOSE, listener)
  },

  signalCloseGuardReady: () =>
    ipcRenderer.send(IPC_CHANNELS.APP_CLOSE_GUARD_READY),
  signalReadyToClose: () => ipcRenderer.send(IPC_CHANNELS.APP_READY_TO_CLOSE),

  getAgentApiInfo: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_API_INFO),
  listPendingAgentImports: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_IMPORT_PENDING),
  onAgentImportRequested: (callback: (request: AgentImportRequest) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, request: AgentImportRequest) => callback(request)
    ipcRenderer.on(IPC_CHANNELS.AGENT_IMPORT_REQUESTED, listener)
    return () => ipcRenderer.removeListener(IPC_CHANNELS.AGENT_IMPORT_REQUESTED, listener)
  },
  resolveAgentImport: (id, status, result) =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_IMPORT_RESOLVE, id, status, result),
} satisfies ElectronAPI)
