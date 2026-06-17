import { create } from 'zustand'
import { getISOWeek, getISOWeekYear } from 'date-fns'

interface UIState {
  // 当前选中的周
  currentYear: number
  currentWeekNumber: number

  // 当前选中的天 (0-6，用于日记切换)
  selectedDayIndex: number

  // 侧边栏标签页
  sidebarTab: 'habits' | 'diary' | 'review'

  // 脏标记（是否有未保存变更）
  isDirty: boolean

  // 分割比例
  mainAreaSplitRatio: number // 上下分割比例 (0-1)

  // 时间块视图是否展开
  timeBlockExpanded: boolean

  // DDL 面板是否打开
  deadlinePanelOpen: boolean

  // Actions
  setWeek: (year: number, weekNumber: number) => void
  goToPrevWeek: () => void
  goToNextWeek: () => void
  goToToday: () => void
  setSelectedDay: (dayIndex: number) => void
  setSidebarTab: (tab: 'habits' | 'diary' | 'review') => void
  setDirty: (dirty: boolean) => void
  setMainAreaSplitRatio: (ratio: number) => void
  setTimeBlockExpanded: (expanded: boolean) => void
  toggleDeadlinePanel: () => void
}

function getTodayWeekInfo() {
  const now = new Date()
  return {
    year: getISOWeekYear(now),
    weekNumber: getISOWeek(now),
  }
}

const todayInfo = getTodayWeekInfo()

export const useUIStore = create<UIState>((set) => ({
  currentYear: todayInfo.year,
  currentWeekNumber: todayInfo.weekNumber,
  selectedDayIndex: (new Date().getDay() + 6) % 7, // 周一=0
  sidebarTab: 'habits',
  isDirty: false,
  mainAreaSplitRatio: 0.55,
  timeBlockExpanded: true,
  deadlinePanelOpen: false,

  setWeek: (year, weekNumber) =>
    set({ currentYear: year, currentWeekNumber: weekNumber }),

  goToPrevWeek: () =>
    set((state) => {
      // 用当前周的周一减去7天得到上周
      const jan4 = new Date(state.currentYear, 0, 4)
      const weekOffset = state.currentWeekNumber - getISOWeek(jan4)
      const monday = new Date(jan4.getTime() + weekOffset * 7 * 86400000)
      // 周一就是 startOfISOWeek... 这里简化用当前周一周减7天
      const prevMonday = new Date(monday.getTime() - 7 * 86400000)
      return {
        currentYear: getISOWeekYear(prevMonday),
        currentWeekNumber: getISOWeek(prevMonday),
      }
    }),

  goToNextWeek: () =>
    set((state) => {
      const jan4 = new Date(state.currentYear, 0, 4)
      const weekOffset = state.currentWeekNumber - getISOWeek(jan4)
      const monday = new Date(jan4.getTime() + weekOffset * 7 * 86400000)
      const nextMonday = new Date(monday.getTime() + 7 * 86400000)
      return {
        currentYear: getISOWeekYear(nextMonday),
        currentWeekNumber: getISOWeek(nextMonday),
      }
    }),

  goToToday: () => {
    const { year, weekNumber } = getTodayWeekInfo()
    set({ currentYear: year, currentWeekNumber: weekNumber })
  },

  setSelectedDay: (dayIndex) => set({ selectedDayIndex: dayIndex }),

  setSidebarTab: (tab) => set({ sidebarTab: tab }),

  setDirty: (dirty) => set({ isDirty: dirty }),

  setMainAreaSplitRatio: (ratio) => set({ mainAreaSplitRatio: ratio }),

  setTimeBlockExpanded: (expanded) =>
    set({ timeBlockExpanded: expanded }),

  toggleDeadlinePanel: () =>
    set((state) => ({ deadlinePanelOpen: !state.deadlinePanelOpen })),
}))
