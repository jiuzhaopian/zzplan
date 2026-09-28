import type {
  ImportBlockCategory,
  ImportDay,
  ImportPriority,
  ImportTimeOfDay,
  NormalizedPlanImport,
  NormalizedPlanImportBatch,
} from '../../shared/planImport'
import { getWeekDateRange } from '../utils/dateUtils'

interface LegacyPlanValidationResult {
  plan: NormalizedPlanImport | null
  errors: string[]
}

export interface PlanValidationResult {
  plan: NormalizedPlanImportBatch | null
  errors: string[]
}

const DAY_INDEX: Record<ImportDay, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
}

const PRIORITIES: ImportPriority[] = ['high', 'medium', 'low']
const TIMES_OF_DAY: ImportTimeOfDay[] = ['morning', 'afternoon', 'evening']
const CATEGORIES: ImportBlockCategory[] = ['work', 'study', 'life', 'other']
const MAX_ITEMS = 500
const MAX_WEEKS = 104
const ROOT_V1_KEYS = ['schemaVersion', 'target', 'tasks', 'timeBlocks', 'habits', 'deadlines']
const ROOT_V2_KEYS = ['schemaVersion', 'weeks']
const WEEK_KEYS = ['target', 'tasks', 'timeBlocks', 'habits', 'deadlines']
const TARGET_KEYS = ['year', 'weekNumber']
const TASK_KEYS = ['day', 'title', 'priority', 'timeOfDay']
const TIME_BLOCK_KEYS = ['day', 'title', 'category', 'start', 'end']
const HABIT_KEYS = ['name']
const DEADLINE_KEYS = ['title', 'date', 'time']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function rejectUnknownKeys(
  value: Record<string, unknown>,
  allowedKeys: string[],
  path: string,
  errors: string[]
): void {
  const allowed = new Set(allowedKeys)
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      errors.push(`${path ? `${path}.` : ''}${key} 是未知字段；为避免静默丢失，已拒绝导入`)
    }
  }
}

function rejectUnknownWeekFields(
  value: Record<string, unknown>,
  path: string,
  errors: string[]
): void {
  if (isRecord(value.target)) rejectUnknownKeys(value.target, TARGET_KEYS, `${path ? `${path}.` : ''}target`, errors)
  const arrays: Array<[string, string[]]> = [
    ['tasks', TASK_KEYS],
    ['timeBlocks', TIME_BLOCK_KEYS],
    ['habits', HABIT_KEYS],
    ['deadlines', DEADLINE_KEYS],
  ]
  for (const [key, allowedKeys] of arrays) {
    const items = value[key]
    if (!Array.isArray(items)) continue
    items.forEach((item, index) => {
      if (isRecord(item)) {
        rejectUnknownKeys(item, allowedKeys, `${path ? `${path}.` : ''}${key}[${index}]`, errors)
      }
    })
  }
}

function readTitle(value: unknown, path: string, errors: string[]): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${path} 必须是非空字符串`)
    return null
  }
  const title = value.trim()
  if (title.length > 200) {
    errors.push(`${path} 不能超过 200 个字符`)
    return null
  }
  return title
}

function readDay(value: unknown, path: string, errors: string[]): number | null {
  if (Number.isInteger(value) && Number(value) >= 0 && Number(value) <= 6) {
    return Number(value)
  }
  if (typeof value === 'string' && value.toLowerCase() in DAY_INDEX) {
    return DAY_INDEX[value.toLowerCase() as ImportDay]
  }
  errors.push(`${path} 必须是 monday-sunday 或 0-6`)
  return null
}

function readTime(value: unknown, path: string, errors: string[]): number | null {
  if (typeof value !== 'string' || !/^\d{2}:\d{2}$/.test(value)) {
    errors.push(`${path} 必须使用 HH:mm 格式`)
    return null
  }
  const [hour, minute] = value.split(':').map(Number)
  if (hour < 0 || hour > 24 || minute < 0 || minute > 59 || (hour === 24 && minute !== 0)) {
    errors.push(`${path} 不是有效时间`)
    return null
  }
  return hour + minute / 60
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

function readArray(root: Record<string, unknown>, key: string, errors: string[]): unknown[] {
  const value = root[key]
  if (value === undefined) return []
  if (!Array.isArray(value)) {
    errors.push(`${key} 必须是数组`)
    return []
  }
  return value
}

function validateLegacyPlanImport(
  value: unknown,
  currentYear: number,
  currentWeekNumber: number
): LegacyPlanValidationResult {
  const errors: string[] = []
  if (!isRecord(value)) {
    return { plan: null, errors: ['导入内容必须是 JSON 对象'] }
  }

  if (value.schemaVersion !== undefined && value.schemaVersion !== 1) {
    errors.push('schemaVersion 目前只支持 1')
  }

  let target: NormalizedPlanImport['target'] = {
    year: currentYear,
    weekNumber: currentWeekNumber,
  }
  if (value.target !== undefined) {
    if (!isRecord(value.target)) {
      errors.push('target 必须是对象')
    } else {
      const year = value.target.year
      const weekNumber = value.target.weekNumber
      if (
        !Number.isInteger(year) ||
        Number(year) < 1970 ||
        Number(year) > 9999 ||
        !Number.isInteger(weekNumber) ||
        Number(weekNumber) < 1 ||
        Number(weekNumber) > 53
      ) {
        errors.push('target.year 和 target.weekNumber 必须是有效整数')
      } else {
        target = { year: Number(year), weekNumber: Number(weekNumber) }
        if (target.year !== currentYear || target.weekNumber !== currentWeekNumber) {
          errors.push(`计划目标为 ${target.year} 年第 ${target.weekNumber} 周，请先切换到该周再导入`)
        }
      }
    }
  }

  const taskItems = readArray(value, 'tasks', errors)
  const blockItems = readArray(value, 'timeBlocks', errors)
  const habitItems = readArray(value, 'habits', errors)
  const deadlineItems = readArray(value, 'deadlines', errors)
  const totalItems = taskItems.length + blockItems.length + habitItems.length + deadlineItems.length
  if (totalItems === 0) errors.push('计划中至少需要一项任务、时间块、习惯或截止日期')
  if (totalItems > MAX_ITEMS) errors.push(`单次最多导入 ${MAX_ITEMS} 项内容`)

  const tasks: NormalizedPlanImport['tasks'] = []
  taskItems.forEach((item, index) => {
    const path = `tasks[${index}]`
    if (!isRecord(item)) {
      errors.push(`${path} 必须是对象`)
      return
    }
    const dayIndex = readDay(item.day, `${path}.day`, errors)
    const title = readTitle(item.title, `${path}.title`, errors)
    const priority = item.priority ?? 'medium'
    const timeOfDay = item.timeOfDay
    if (!PRIORITIES.includes(priority as ImportPriority)) {
      errors.push(`${path}.priority 必须是 high、medium 或 low`)
    }
    if (timeOfDay !== undefined && !TIMES_OF_DAY.includes(timeOfDay as ImportTimeOfDay)) {
      errors.push(`${path}.timeOfDay 必须是 morning、afternoon 或 evening`)
    }
    if (dayIndex !== null && title && PRIORITIES.includes(priority as ImportPriority)) {
      tasks.push({
        dayIndex,
        title,
        priority: priority as ImportPriority,
        timeOfDay: timeOfDay as ImportTimeOfDay | undefined,
      })
    }
  })

  const timeBlocks: NormalizedPlanImport['timeBlocks'] = []
  blockItems.forEach((item, index) => {
    const path = `timeBlocks[${index}]`
    if (!isRecord(item)) {
      errors.push(`${path} 必须是对象`)
      return
    }
    const dayIndex = readDay(item.day, `${path}.day`, errors)
    const title = readTitle(item.title, `${path}.title`, errors)
    const startHour = readTime(item.start, `${path}.start`, errors)
    const endHour = readTime(item.end, `${path}.end`, errors)
    const category = item.category ?? 'work'
    if (!CATEGORIES.includes(category as ImportBlockCategory)) {
      errors.push(`${path}.category 必须是 work、study、life 或 other`)
    }
    if (startHour !== null && endHour !== null && endHour <= startHour) {
      errors.push(`${path}.end 必须晚于 start`)
    }
    if (
      dayIndex !== null &&
      title &&
      startHour !== null &&
      endHour !== null &&
      endHour > startHour &&
      CATEGORIES.includes(category as ImportBlockCategory)
    ) {
      timeBlocks.push({
        dayIndex,
        title,
        category: category as ImportBlockCategory,
        startHour,
        endHour,
      })
    }
  })

  const habits: NormalizedPlanImport['habits'] = []
  habitItems.forEach((item, index) => {
    const path = `habits[${index}]`
    if (!isRecord(item)) {
      errors.push(`${path} 必须是对象`)
      return
    }
    const name = readTitle(item.name, `${path}.name`, errors)
    if (name) habits.push({ name })
  })

  const deadlines: NormalizedPlanImport['deadlines'] = []
  deadlineItems.forEach((item, index) => {
    const path = `deadlines[${index}]`
    if (!isRecord(item)) {
      errors.push(`${path} 必须是对象`)
      return
    }
    const title = readTitle(item.title, `${path}.title`, errors)
    if (!isValidDate(item.date)) errors.push(`${path}.date 必须是有效的 YYYY-MM-DD 日期`)
    let time: string | undefined
    if (item.time !== undefined) {
      if (readTime(item.time, `${path}.time`, errors) !== null) time = item.time as string
    }
    if (title && isValidDate(item.date)) deadlines.push({ title, date: item.date, time })
  })

  return {
    plan: errors.length === 0 ? { target, tasks, timeBlocks, habits, deadlines } : null,
    errors,
  }
}

export function validatePlanImport(
  value: unknown,
  currentYear: number,
  currentWeekNumber: number
): PlanValidationResult {
  if (!isRecord(value)) {
    return { plan: null, errors: ['导入内容必须是 JSON 对象'] }
  }

  const strictErrors: string[] = []
  if (value.schemaVersion !== 2) {
    rejectUnknownKeys(value, ROOT_V1_KEYS, '', strictErrors)
    rejectUnknownWeekFields(value, '', strictErrors)
    const legacy = validateLegacyPlanImport(value, currentYear, currentWeekNumber)
    const errors = [...strictErrors, ...legacy.errors]
    return {
      plan:
        errors.length === 0 && legacy.plan
          ? { schemaVersion: 1, weeks: [legacy.plan] }
          : null,
      errors,
    }
  }

  rejectUnknownKeys(value, ROOT_V2_KEYS, '', strictErrors)
  const rawWeeks = value.weeks
  if (!Array.isArray(rawWeeks)) {
    return { plan: null, errors: [...strictErrors, 'weeks 必须是数组'] }
  }
  if (rawWeeks.length === 0) strictErrors.push('weeks 至少需要包含一周计划')
  if (rawWeeks.length > MAX_WEEKS) strictErrors.push(`单次最多导入 ${MAX_WEEKS} 周`)

  const weeks: NormalizedPlanImport[] = []
  const seenTargets = new Set<string>()
  let totalItems = 0

  rawWeeks.forEach((item, index) => {
    const path = `weeks[${index}]`
    if (!isRecord(item)) {
      strictErrors.push(`${path} 必须是对象`)
      return
    }
    rejectUnknownKeys(item, WEEK_KEYS, path, strictErrors)
    rejectUnknownWeekFields(item, path, strictErrors)

    if (!isRecord(item.target)) {
      strictErrors.push(`${path}.target 必须是对象`)
      return
    }
    const year = item.target.year
    const weekNumber = item.target.weekNumber
    if (
      !Number.isInteger(year) ||
      Number(year) < 1970 ||
      Number(year) > 9999 ||
      !Number.isInteger(weekNumber) ||
      Number(weekNumber) < 1 ||
      Number(weekNumber) > 53
    ) {
      strictErrors.push(`${path}.target.year 和 ${path}.target.weekNumber 必须是有效整数`)
      return
    }

    const targetKey = `${year}-W${weekNumber}`
    if (seenTargets.has(targetKey)) {
      strictErrors.push(`${path}.target 与前面的周重复：${year} 年第 ${weekNumber} 周`)
      return
    }
    seenTargets.add(targetKey)

    for (const key of ['tasks', 'timeBlocks', 'habits', 'deadlines']) {
      const items = item[key]
      if (Array.isArray(items)) totalItems += items.length
    }

    const legacy = validateLegacyPlanImport(
      { schemaVersion: 1, ...item },
      Number(year),
      Number(weekNumber)
    )
    if (legacy.errors.length > 0) {
      strictErrors.push(...legacy.errors.map((error) => `${path}.${error}`))
      return
    }
    if (legacy.plan) {
      const dateRange = getWeekDateRange(Number(year), Number(weekNumber))
      const misplacedDeadline = legacy.plan.deadlines.find(
        (deadline) => deadline.date < dateRange.monday || deadline.date > dateRange.sunday
      )
      if (misplacedDeadline) {
        strictErrors.push(
          `${path}.deadlines 中的 ${misplacedDeadline.date} 不属于该目标周；请把它放入对应周`
        )
        return
      }
      weeks.push(legacy.plan)
    }
  })

  if (totalItems > MAX_ITEMS) strictErrors.push(`单次最多导入 ${MAX_ITEMS} 项内容`)
  weeks.sort(
    (a, b) => a.target.year - b.target.year || a.target.weekNumber - b.target.weekNumber
  )

  return {
    plan: strictErrors.length === 0 ? { schemaVersion: 2, weeks } : null,
    errors: strictErrors,
  }
}

export function createPlanImportExample(year: number, weekNumber: number): string {
  return JSON.stringify(
    {
      schemaVersion: 2,
      weeks: [
        {
          target: { year, weekNumber },
          tasks: [
            { day: 'monday', title: '完成项目方案', priority: 'high', timeOfDay: 'morning' },
          ],
          timeBlocks: [
            { day: 'monday', title: '深度工作', category: 'work', start: '09:00', end: '11:00' },
          ],
          habits: [{ name: '阅读' }],
          deadlines: [],
        },
      ],
    },
    null,
    2
  )
}
