import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipcChannels'
import type { AgentImportStatus } from '../../shared/planImport'
import { agentApiService } from '../services/agentApiService'

export function registerAgentHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.AGENT_API_INFO, () => agentApiService.getInfo())
  ipcMain.handle(IPC_CHANNELS.AGENT_IMPORT_PENDING, () => agentApiService.listPendingImports())
  ipcMain.handle(
    IPC_CHANNELS.AGENT_IMPORT_RESOLVE,
    (_event, id: string, status: Exclude<AgentImportStatus, 'pending'>, result?: unknown) =>
      agentApiService.resolveImport(id, status, result)
  )
}
