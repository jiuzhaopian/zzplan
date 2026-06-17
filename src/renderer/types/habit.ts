export interface Habit {
  id: string
  name: string
  checks: Record<number, boolean> // key 为 dayIndex (0-6)
  createdAt: string
}
