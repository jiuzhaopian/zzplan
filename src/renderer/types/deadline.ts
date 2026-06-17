export interface Deadline {
  id: string
  title: string
  date: string // "YYYY-MM-DD"
  time?: string // "HH:MM" - 可选
  completed: boolean
  createdAt: string // ISO 8601
}
