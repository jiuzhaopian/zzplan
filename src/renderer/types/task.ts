export type Priority = 'high' | 'medium' | 'low'
export type TimeOfDay = 'morning' | 'afternoon' | 'evening'

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bgColor: string }
> = {
  high: { label: '高', color: '#ef4444', bgColor: '#fef2f2' },
  medium: { label: '中', color: '#f59e0b', bgColor: '#fffbeb' },
  low: { label: '低', color: '#22c55e', bgColor: '#f0fdf4' },
}

export const TIME_OF_DAY_CONFIG: Record<
  TimeOfDay,
  { label: string; color: string; bgColor: string }
> = {
  morning: { label: '早', color: '#f59e0b', bgColor: '#fffbeb' },
  afternoon: { label: '午', color: '#ef4444', bgColor: '#fef2f2' },
  evening: { label: '晚', color: '#6366f1', bgColor: '#eef2ff' },
}

export interface Task {
  id: string
  title: string
  priority: Priority
  timeOfDay?: TimeOfDay
  completed: boolean
  dayIndex: number // 0=周一, 1=周二 ... 6=周日
  sortOrder: number
  createdAt: string
  completedAt?: string
}
