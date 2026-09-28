import type { WeekData } from '../types/week'
import type { Deadline } from '../types/deadline'
import type {
  NormalizedPlanImport,
  PlanImportMode,
  PlanImportResult,
} from '../../shared/planImport'

interface ApplyPlanImportOptions {
  weekData: WeekData
  deadlines: Deadline[]
  plan: NormalizedPlanImport
  mode: PlanImportMode
  createId: () => string
  now: string
}

export interface AppliedPlanImport {
  weekData: WeekData
  deadlines: Deadline[]
  result: PlanImportResult
}

export function applyPlanImport({
  weekData,
  deadlines: currentDeadlines,
  plan,
  mode,
  createId,
  now,
}: ApplyPlanImportOptions): AppliedPlanImport {
  const emptyCounts = { tasks: 0, timeBlocks: 0, habits: 0, deadlines: 0 }
  const added = { ...emptyCounts }
  const skipped = { ...emptyCounts }
  const tasks = mode === 'replace' ? [] : [...weekData.tasks]
  const timeBlocks = mode === 'replace' ? [] : [...weekData.timeBlocks]
  const habits = mode === 'replace' ? [] : [...weekData.habits]
  const deadlines =
    mode === 'replace'
      ? currentDeadlines.filter(
          (deadline) =>
            deadline.date < weekData.meta.dateRange.monday ||
            deadline.date > weekData.meta.dateRange.sunday
        )
      : [...currentDeadlines]

  const taskKeys = new Set(tasks.map((task) => `${task.dayIndex}|${task.title.trim().toLowerCase()}`))
  const blockKeys = new Set(
    timeBlocks.map(
      (block) =>
        `${block.dayIndex}|${block.startHour}|${block.endHour}|${block.title.trim().toLowerCase()}`
    )
  )
  const habitKeys = new Set(habits.map((habit) => habit.name.trim().toLowerCase()))
  const deadlineKeys = new Set(
    deadlines.map(
      (deadline) =>
        `${deadline.date}|${deadline.time ?? ''}|${deadline.title.trim().toLowerCase()}`
    )
  )
  const nextSortOrder = new Map<number, number>()
  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    const maxOrder = tasks
      .filter((task) => task.dayIndex === dayIndex)
      .reduce((max, task) => Math.max(max, task.sortOrder), -1)
    nextSortOrder.set(dayIndex, maxOrder + 1)
  }

  for (const item of plan.tasks) {
    const key = `${item.dayIndex}|${item.title.toLowerCase()}`
    if (taskKeys.has(key)) {
      skipped.tasks++
      continue
    }
    taskKeys.add(key)
    const sortOrder = nextSortOrder.get(item.dayIndex) ?? 0
    nextSortOrder.set(item.dayIndex, sortOrder + 1)
    tasks.push({
      id: createId(),
      title: item.title,
      priority: item.priority,
      timeOfDay: item.timeOfDay,
      completed: false,
      dayIndex: item.dayIndex,
      sortOrder,
      createdAt: now,
    })
    added.tasks++
  }

  for (const item of plan.timeBlocks) {
    const key = `${item.dayIndex}|${item.startHour}|${item.endHour}|${item.title.toLowerCase()}`
    if (blockKeys.has(key)) {
      skipped.timeBlocks++
      continue
    }
    blockKeys.add(key)
    timeBlocks.push({ id: createId(), ...item, createdAt: now })
    added.timeBlocks++
  }

  for (const item of plan.habits) {
    const key = item.name.toLowerCase()
    if (habitKeys.has(key) || habits.length >= 5) {
      skipped.habits++
      continue
    }
    habitKeys.add(key)
    habits.push({
      id: createId(),
      name: item.name,
      checks: { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
      createdAt: now,
    })
    added.habits++
  }

  for (const item of plan.deadlines) {
    const key = `${item.date}|${item.time ?? ''}|${item.title.toLowerCase()}`
    if (deadlineKeys.has(key)) {
      skipped.deadlines++
      continue
    }
    deadlineKeys.add(key)
    deadlines.push({
      id: createId(),
      title: item.title,
      date: item.date,
      time: item.time,
      completed: false,
      createdAt: now,
    })
    added.deadlines++
  }

  return {
    weekData: {
      ...weekData,
      tasks,
      timeBlocks,
      habits,
      meta: { ...weekData.meta, updatedAt: now },
    },
    deadlines,
    result: { added, skipped },
  }
}
