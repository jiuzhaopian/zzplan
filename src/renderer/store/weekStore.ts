import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { WeekData } from '../types/week'
import type { Task, Priority } from '../types/task'
import type { TimeBlock, BlockCategory } from '../types/timeBlock'
import type { Habit } from '../types/habit'
import type { Deadline } from '../types/deadline'
import { createEmptyWeekData } from '../types/week'
import { getWeekDateRange } from '../utils/dateUtils'

interface WeekState {
  weekData: WeekData | null
  isLoading: boolean
  deadlines: Deadline[]
  deadlinesLoaded: boolean

  // 加载周数据
  loadWeek: (year: number, weekNumber: number) => Promise<void>

  // Tasks
  addTask: (dayIndex: number, title: string, priority: Priority) => void
  toggleTask: (taskId: string) => void
  updateTaskTitle: (taskId: string, title: string) => void
  updateTaskPriority: (taskId: string, priority: Priority) => void
  deleteTask: (taskId: string) => void
  moveTask: (taskId: string, targetDayIndex: number) => void
  reorderTasks: (dayIndex: number, taskIds: string[]) => void

  // TimeBlocks
  addTimeBlock: (
    dayIndex: number,
    title: string,
    category: BlockCategory,
    startHour: number,
    endHour: number
  ) => void
  updateTimeBlock: (
    blockId: string,
    updates: Partial<Pick<TimeBlock, 'title' | 'category' | 'startHour' | 'endHour'>>
  ) => void
  deleteTimeBlock: (blockId: string) => void

  // Habits
  addHabit: (name: string) => void
  toggleHabitCheck: (habitId: string, dayIndex: number) => void
  deleteHabit: (habitId: string) => void
  updateHabitName: (habitId: string, name: string) => void

  // Diary
  updateDiary: (dayIndex: number, content: string) => void

  // Review
  updateReview: (questionIndex: number, answer: string) => void

  // Deadlines（全局）
  loadGlobalDeadlines: () => Promise<void>
  addDeadline: (title: string, date: string, time?: string) => void
  toggleDeadline: (deadlineId: string) => void
  deleteDeadline: (deadlineId: string) => void
  _saveDeadlines: () => Promise<void>
}

export const useWeekStore = create<WeekState>((set, get) => ({
  weekData: null,
  isLoading: false,
  deadlines: [],
  deadlinesLoaded: false,

  loadWeek: async (year, weekNumber) => {
    // 先保存当前周数据，防止切换周时丢失未保存的更改
    const currentData = get().weekData
    if (currentData && window.electronAPI) {
      try {
        await window.electronAPI.saveWeek(
          currentData.meta.year,
          currentData.meta.weekNumber,
          {
            ...currentData,
            meta: { ...currentData.meta, updatedAt: new Date().toISOString() },
          }
        )
      } catch (err) {
        console.error('切换周前保存失败:', err)
      }
    }

    set({ isLoading: true })
    try {
      let data: WeekData | null = null

      if (window.electronAPI) {
        const result = await window.electronAPI.loadWeek(year, weekNumber)
        data = result as WeekData | null
      }

      if (!data) {
        // 没有保存的数据，创建空结构
        const dateRange = getWeekDateRange(year, weekNumber)
        data = createEmptyWeekData(year, weekNumber, dateRange)
      }

      set({ weekData: data, isLoading: false })
    } catch (error) {
      console.error('加载周数据失败:', error)
      // 回退到空数据
      const dateRange = getWeekDateRange(year, weekNumber)
      set({
        weekData: createEmptyWeekData(year, weekNumber, dateRange),
        isLoading: false,
      })
    }
  },

  // ==================== Tasks ====================
  addTask: (dayIndex, title, priority) => {
    set((state) => {
      if (!state.weekData) return state
      const tasks = [...state.weekData.tasks]
      const dayTasks = tasks.filter((t) => t.dayIndex === dayIndex)
      const maxOrder = dayTasks.reduce((max, t) => Math.max(max, t.sortOrder), -1)

      const newTask: Task = {
        id: uuidv4(),
        title,
        priority,
        completed: false,
        dayIndex,
        sortOrder: maxOrder + 1,
        createdAt: new Date().toISOString(),
      }

      return {
        weekData: {
          ...state.weekData,
          tasks: [...tasks, newTask],
          meta: {
            ...state.weekData.meta,
            updatedAt: new Date().toISOString(),
          },
        },
      }
    })
  },

  toggleTask: (taskId) => {
    set((state) => {
      if (!state.weekData) return state
      const tasks = state.weekData.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t
      )
      return {
        weekData: {
          ...state.weekData,
          tasks,
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  updateTaskTitle: (taskId, title) => {
    set((state) => {
      if (!state.weekData) return state
      const tasks = state.weekData.tasks.map((t) =>
        t.id === taskId ? { ...t, title } : t
      )
      return {
        weekData: {
          ...state.weekData,
          tasks,
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  updateTaskPriority: (taskId, priority) => {
    set((state) => {
      if (!state.weekData) return state
      const tasks = state.weekData.tasks.map((t) =>
        t.id === taskId ? { ...t, priority } : t
      )
      return {
        weekData: {
          ...state.weekData,
          tasks,
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  deleteTask: (taskId) => {
    set((state) => {
      if (!state.weekData) return state
      return {
        weekData: {
          ...state.weekData,
          tasks: state.weekData.tasks.filter((t) => t.id !== taskId),
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  moveTask: (taskId, targetDayIndex) => {
    set((state) => {
      if (!state.weekData) return state
      const tasks = state.weekData.tasks.map((t) => {
        if (t.id === taskId) {
          // 获取目标日最大的 sortOrder
          const targetTasks = state.weekData!.tasks.filter(
            (tt) => tt.dayIndex === targetDayIndex && tt.id !== taskId
          )
          const maxOrder = targetTasks.reduce(
            (max, tt) => Math.max(max, tt.sortOrder),
            -1
          )
          return { ...t, dayIndex: targetDayIndex, sortOrder: maxOrder + 1 }
        }
        return t
      })
      return {
        weekData: {
          ...state.weekData,
          tasks,
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  reorderTasks: (dayIndex, taskIds) => {
    set((state) => {
      if (!state.weekData) return state
      const tasks = state.weekData.tasks.map((t) => {
        if (t.dayIndex === dayIndex) {
          const newIndex = taskIds.indexOf(t.id)
          if (newIndex !== -1) {
            return { ...t, sortOrder: newIndex }
          }
        }
        return t
      })
      return {
        weekData: {
          ...state.weekData,
          tasks,
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  // ==================== TimeBlocks ====================
  addTimeBlock: (dayIndex, title, category, startHour, endHour) => {
    set((state) => {
      if (!state.weekData) return state
      const newBlock: TimeBlock = {
        id: uuidv4(),
        title,
        category,
        dayIndex,
        startHour,
        endHour,
        createdAt: new Date().toISOString(),
      }
      return {
        weekData: {
          ...state.weekData,
          timeBlocks: [...state.weekData.timeBlocks, newBlock],
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  updateTimeBlock: (blockId, updates) => {
    set((state) => {
      if (!state.weekData) return state
      const timeBlocks = state.weekData.timeBlocks.map((b) =>
        b.id === blockId ? { ...b, ...updates } : b
      )
      return {
        weekData: {
          ...state.weekData,
          timeBlocks,
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  deleteTimeBlock: (blockId) => {
    set((state) => {
      if (!state.weekData) return state
      return {
        weekData: {
          ...state.weekData,
          timeBlocks: state.weekData.timeBlocks.filter((b) => b.id !== blockId),
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  // ==================== Habits ====================
  addHabit: (name) => {
    set((state) => {
      if (!state.weekData) return state
      if (state.weekData.habits.length >= 5) return state // 最多5个
      const checks: Record<number, boolean> = {}
      for (let i = 0; i < 7; i++) checks[i] = false
      const newHabit: Habit = {
        id: uuidv4(),
        name,
        checks,
        createdAt: new Date().toISOString(),
      }
      return {
        weekData: {
          ...state.weekData,
          habits: [...state.weekData.habits, newHabit],
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  toggleHabitCheck: (habitId, dayIndex) => {
    set((state) => {
      if (!state.weekData) return state
      const habits = state.weekData.habits.map((h) => {
        if (h.id === habitId) {
          return {
            ...h,
            checks: { ...h.checks, [dayIndex]: !h.checks[dayIndex] },
          }
        }
        return h
      })
      return {
        weekData: {
          ...state.weekData,
          habits,
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  deleteHabit: (habitId) => {
    set((state) => {
      if (!state.weekData) return state
      return {
        weekData: {
          ...state.weekData,
          habits: state.weekData.habits.filter((h) => h.id !== habitId),
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  updateHabitName: (habitId, name) => {
    set((state) => {
      if (!state.weekData) return state
      const habits = state.weekData.habits.map((h) =>
        h.id === habitId ? { ...h, name } : h
      )
      return {
        weekData: {
          ...state.weekData,
          habits,
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  // ==================== Diary ====================
  updateDiary: (dayIndex, content) => {
    set((state) => {
      if (!state.weekData) return state
      const diary = { ...state.weekData.diary }
      const key = String(dayIndex)
      diary[key] = {
        content,
        updatedAt: new Date().toISOString(),
      }
      return {
        weekData: {
          ...state.weekData,
          diary,
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  // ==================== Review ====================
  updateReview: (questionIndex, answer) => {
    set((state) => {
      if (!state.weekData) return state
      const answers = [...state.weekData.review.answers] as [string, string, string]
      answers[questionIndex] = answer
      return {
        weekData: {
          ...state.weekData,
          review: {
            answers,
            updatedAt: new Date().toISOString(),
          },
          meta: { ...state.weekData.meta, updatedAt: new Date().toISOString() },
        },
      }
    })
  },

  // ==================== Deadlines（全局） ====================
  loadGlobalDeadlines: async () => {
    if (get().deadlinesLoaded) return
    try {
      if (window.electronAPI) {
        const data = await window.electronAPI.loadDeadlines()
        set({ deadlines: (data as Deadline[]) ?? [], deadlinesLoaded: true })
      }
    } catch (error) {
      console.error('加载全局 DDL 失败:', error)
      set({ deadlinesLoaded: true })
    }
  },

  _saveDeadlines: async () => {
    const { deadlines } = get()
    if (window.electronAPI) {
      await window.electronAPI.saveDeadlines(deadlines)
    }
  },

  addDeadline: (title, date, time) => {
    const newDeadline: Deadline = {
      id: uuidv4(),
      title,
      date,
      time,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      deadlines: [...state.deadlines, newDeadline],
    }))
    // 立即持久化
    get()._saveDeadlines()
  },

  toggleDeadline: (deadlineId) => {
    set((state) => ({
      deadlines: state.deadlines.map((d) =>
        d.id === deadlineId ? { ...d, completed: !d.completed } : d
      ),
    }))
    get()._saveDeadlines()
  },

  deleteDeadline: (deadlineId) => {
    set((state) => ({
      deadlines: state.deadlines.filter((d) => d.id !== deadlineId),
    }))
    get()._saveDeadlines()
  },
}))
