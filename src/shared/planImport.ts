export type ImportDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type ImportPriority = 'high' | 'medium' | 'low'
export type ImportTimeOfDay = 'morning' | 'afternoon' | 'evening'
export type ImportBlockCategory = 'work' | 'study' | 'life' | 'other'
export type PlanImportMode = 'merge' | 'replace'

export interface PlanImportTarget {
  year: number
  weekNumber: number
}

export interface PlanImportWeekPayload {
  target: PlanImportTarget
  tasks?: Array<{
    day: ImportDay | number
    title: string
    priority?: ImportPriority
    timeOfDay?: ImportTimeOfDay
  }>
  timeBlocks?: Array<{
    day: ImportDay | number
    title: string
    category?: ImportBlockCategory
    start: string
    end: string
  }>
  habits?: Array<{
    name: string
  }>
  deadlines?: Array<{
    title: string
    date: string
    time?: string
  }>
}

export interface PlanImportPayloadV1 {
  schemaVersion?: 1
  target?: PlanImportTarget
  tasks?: Array<{
    day: ImportDay | number
    title: string
    priority?: ImportPriority
    timeOfDay?: ImportTimeOfDay
  }>
  timeBlocks?: Array<{
    day: ImportDay | number
    title: string
    category?: ImportBlockCategory
    start: string
    end: string
  }>
  habits?: Array<{
    name: string
  }>
  deadlines?: Array<{
    title: string
    date: string
    time?: string
  }>
}

export interface PlanImportPayloadV2 {
  schemaVersion: 2
  weeks: PlanImportWeekPayload[]
}

export type PlanImportPayload = PlanImportPayloadV1 | PlanImportPayloadV2

export interface NormalizedPlanImport {
  target: PlanImportTarget
  tasks: Array<{
    dayIndex: number
    title: string
    priority: ImportPriority
    timeOfDay?: ImportTimeOfDay
  }>
  timeBlocks: Array<{
    dayIndex: number
    title: string
    category: ImportBlockCategory
    startHour: number
    endHour: number
  }>
  habits: Array<{
    name: string
  }>
  deadlines: Array<{
    title: string
    date: string
    time?: string
  }>
}

export interface NormalizedPlanImportBatch {
  schemaVersion: 1 | 2
  weeks: NormalizedPlanImport[]
}

export interface PlanImportCounts {
  tasks: number
  timeBlocks: number
  habits: number
  deadlines: number
}

export interface PlanImportResult {
  added: PlanImportCounts
  skipped: PlanImportCounts
}

export interface PlanImportBatchResult extends PlanImportResult {
  weeks: number
  targets: PlanImportTarget[]
}

export interface WeekWritePayload extends PlanImportTarget {
  data: unknown
}

export interface PlanBatchWritePayload {
  weeks: WeekWritePayload[]
  deadlines: unknown[]
}

export interface AgentImportRequest {
  id: string
  payload: unknown
  createdAt: string
}

export type AgentImportStatus = 'pending' | 'accepted' | 'rejected' | 'failed'

export interface AgentApiInfo {
  enabled: boolean
  endpoint: string
  token: string
  error?: string
}
