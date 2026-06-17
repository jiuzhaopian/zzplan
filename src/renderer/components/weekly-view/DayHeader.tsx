interface DayHeaderProps {
  date: Date
  isToday: boolean
}

const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export default function DayHeader({ date, isToday }: DayHeaderProps) {
  const dayIndex = (date.getDay() + 6) % 7
  const dayLabel = WEEKDAY_LABELS[dayIndex]
  const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`

  return (
    <div className="text-center py-2 select-none">
      <div className="text-[13px] text-[#64748b] font-[500] mb-0.5">
        {dayLabel}
      </div>
      <div
        className={`inline-flex items-center justify-center min-w-[2rem] h-8 px-1 rounded-full text-[15px] font-[600] transition-colors ${
          isToday
            ? 'bg-primary-500 text-white shadow-sm shadow-primary-200'
            : 'text-[#1e293b]'
        }`}
      >
        {dateLabel}
      </div>
    </div>
  )
}
