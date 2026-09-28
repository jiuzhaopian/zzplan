import { registerFileHandlers } from './fileHandlers'
import { registerAgentHandlers } from './agentHandlers'

export function registerAllHandlers(): void {
  registerFileHandlers()
  registerAgentHandlers()
}
