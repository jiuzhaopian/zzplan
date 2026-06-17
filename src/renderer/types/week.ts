import type { Task } from './task'
import type { TimeBlock } from './timeBlock'
import type { Habit } from './habit'
import type { DiaryEntry } from './diary'
import type { WeeklyReview } from './review'

export interface WeekMeta {
  year: number
  weekNumber: number
  dateRange: {
    monday: string
    sunday: string
  }
  updatedAt: string
}

export interface WeekData {
  meta: WeekMeta
  tasks: Task[]
  timeBlocks: TimeBlock[]
  habits: Habit[]
  diary: Record<string, DiaryEntry>
  review: WeeklyReview
}

/** 创建空的周数据 */
export function createEmptyWeekData(
  year: number,
  weekNumber: number,
  dateRange: { monday: string; sunday: string }
): WeekData {
  return {
    meta: {
      year,
      weekNumber,
      dateRange,
      updatedAt: new Date().toISOString(),
    },
    tasks: [],
    timeBlocks: [],
    habits: [],
    diary: {},
    review: {
      answers: ['', '', ''],
      updatedAt: new Date().toISOString(),
    },
  }
}
