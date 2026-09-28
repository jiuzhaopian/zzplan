import type { WeekData } from '../types/week'

type SaveResult = { success: boolean; error?: string }

let weekSaveQueue: Promise<void> = Promise.resolve()

/**
 * 串行化周数据写入，避免自动保存、手动保存和切周保存互相覆盖。
 */
export function persistWeekData(data: WeekData): Promise<SaveResult> {
  const operation = weekSaveQueue.then(() =>
    window.electronAPI.saveWeek(data.meta.year, data.meta.weekNumber, {
      ...data,
      meta: { ...data.meta, updatedAt: new Date().toISOString() },
    })
  )

  weekSaveQueue = operation.then(
    () => undefined,
    () => undefined
  )

  return operation
}
