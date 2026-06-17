import {
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  endOfISOWeek,
  eachDayOfInterval,
  format,
} from 'date-fns'

export interface WeekInfo {
  year: number
  weekNumber: number
}

export interface WeekDateRange {
  monday: string
  sunday: string
}

export class WeekService {
  /** 获取给定日期所在的 ISO 周信息 */
  getWeekInfo(date: Date): WeekInfo {
    return {
      year: getISOWeekYear(date),
      weekNumber: getISOWeek(date),
    }
  }

  /** 获取某周 7 天的日期数组（周一到周日） */
  getWeekDates(year: number, weekNumber: number): Date[] {
    // 1月4日总是在第1周
    const jan4 = new Date(year, 0, 4)
    const jan4Week = getISOWeek(jan4)
    const weekOffset = weekNumber - jan4Week
    const weekStart = startOfISOWeek(
      new Date(jan4.getTime() + weekOffset * 7 * 86400000)
    )
    return eachDayOfInterval({ start: weekStart, end: endOfISOWeek(weekStart) })
  }

  /** 获取某周的日期范围字符串 */
  getWeekDateRange(year: number, weekNumber: number): WeekDateRange {
    const dates = this.getWeekDates(year, weekNumber)
    return {
      monday: format(dates[0], 'yyyy-MM-dd'),
      sunday: format(dates[6], 'yyyy-MM-dd'),
    }
  }

  /** 获取日期显示标签（如 "6月9日 - 6月15日"） */
  getWeekLabel(year: number, weekNumber: number): string {
    const dates = this.getWeekDates(year, weekNumber)
    const monday = dates[0]
    const sunday = dates[6]

    const formatDate = (d: Date) => {
      return `${d.getMonth() + 1}月${d.getDate()}日`
    }

    return `${formatDate(monday)} - ${formatDate(sunday)}`
  }

  /** 获取日常日期格式化字符串 */
  getDayLabel(date: Date): string {
    const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const dayIndex = (date.getDay() + 6) % 7 // 转换为周一=0
    return `${weekdays[dayIndex]} ${date.getMonth() + 1}/${date.getDate()}`
  }
}

export const weekService = new WeekService()
