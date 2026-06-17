import {
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  endOfISOWeek,
  eachDayOfInterval,
  format,
} from 'date-fns'

export interface WeekDateRange {
  monday: string
  sunday: string
}

/** 获取给定日期所在的 ISO 周信息 */
export function getWeekInfo(date: Date): { year: number; weekNumber: number } {
  return {
    year: getISOWeekYear(date),
    weekNumber: getISOWeek(date),
  }
}

/** 获取某周 7 天的日期数组（周一到周日） */
export function getWeekDates(year: number, weekNumber: number): Date[] {
  const jan4 = new Date(year, 0, 4)
  const jan4Week = getISOWeek(jan4)
  const weekOffset = weekNumber - jan4Week
  const weekStart = startOfISOWeek(
    new Date(jan4.getTime() + weekOffset * 7 * 86400000)
  )
  return eachDayOfInterval({ start: weekStart, end: endOfISOWeek(weekStart) })
}

/** 获取某周的日期范围字符串 */
export function getWeekDateRange(
  year: number,
  weekNumber: number
): WeekDateRange {
  const dates = getWeekDates(year, weekNumber)
  return {
    monday: format(dates[0], 'yyyy-MM-dd'),
    sunday: format(dates[6], 'yyyy-MM-dd'),
  }
}

/** 获取周显示标签（如 "6月9日 - 6月15日"） */
export function getWeekLabel(year: number, weekNumber: number): string {
  const dates = getWeekDates(year, weekNumber)
  const formatDate = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`
  return `${formatDate(dates[0])} - ${formatDate(dates[6])}`
}

/** 格式化日期为简短标签 */
export function getDayLabel(date: Date): string {
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const dayIndex = (date.getDay() + 6) % 7
  return `${weekdays[dayIndex]} ${date.getMonth() + 1}/${date.getDate()}`
}

/** 格式化小时为时间字符串 (8.5 → "08:30") */
export function formatHour(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

/** 判断某个日期是否是今天 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}
