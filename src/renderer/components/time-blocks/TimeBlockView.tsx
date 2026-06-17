import { useMemo } from 'react'
import { useWeekStore } from '../../store/weekStore'
import { useUIStore } from '../../store/uiStore'
import TimeDayColumn from './TimeDayColumn'
import TimeAxis from './TimeAxis'
import { getWeekDates } from '../../utils/dateUtils'

const HOUR_HEIGHT = 60 // 每小时 60px
const HALF_HOUR_HEIGHT = HOUR_HEIGHT / 2
const TOTAL_HEIGHT = HOUR_HEIGHT * 24 // 24小时总高度

export default function TimeBlockView() {
  const weekData = useWeekStore((s) => s.weekData)
  const { currentYear, currentWeekNumber } = useUIStore()

  const dates = useMemo(
    () => getWeekDates(currentYear, currentWeekNumber),
    [currentYear, currentWeekNumber]
  )

  if (!weekData) return null

  return (
    <div className="flex h-full overflow-auto rounded-xl bg-white border border-[#dde3ee] shadow-card">
      {/* 时间轴 */}
      <TimeAxis hourHeight={HOUR_HEIGHT} />

      {/* 7 天时间块列 */}
      <div className="flex-1 grid grid-cols-7">
        {dates.map((date, index) => {
          const dayBlocks = weekData.timeBlocks.filter(
            (b) => b.dayIndex === index
          )

          const isToday =
            date.toDateString() === new Date().toDateString()

          return (
            <TimeDayColumn
              key={index}
              dayIndex={index}
              date={date}
              isToday={isToday}
              blocks={dayBlocks}
              hourHeight={HOUR_HEIGHT}
              totalHeight={TOTAL_HEIGHT}
            />
          )
        })}
      </div>
    </div>
  )
}
