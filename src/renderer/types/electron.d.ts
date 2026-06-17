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

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
