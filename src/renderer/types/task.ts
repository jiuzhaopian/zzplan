export type Priority = 'high' | 'medium' | 'low'

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bgColor: string }
> = {
  high: { label: '高', color: '#ef4444', bgColor: '#fef2f2' },
  medium: { label: '中', color: '#f59e0b', bgColor: '#fffbeb' },
  low: { label: '低', color: '#22c55e', bgColor: '#f0fdf4' },
}

export interface Task {
  id: string
  title: string
  priority: Priority
  completed: boolean
  dayIndex: number // 0=周一, 1=周二 ... 6=周日
  sortOrder: number
  createdAt: string
  completedAt?: string
}
