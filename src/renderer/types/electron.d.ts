import type {
  AgentApiInfo,
  AgentImportRequest,
  AgentImportStatus,
  PlanBatchWritePayload,
} from '../../shared/planImport'

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

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
