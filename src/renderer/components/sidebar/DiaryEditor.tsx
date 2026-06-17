import { useWeekStore } from '../../store/weekStore'
import { useUIStore } from '../../store/uiStore'
import { getWeekDates, getDayLabel } from '../../utils/dateUtils'

export default function DiaryEditor() {
  const weekData = useWeekStore((s) => s.weekData)
  const updateDiary = useWeekStore((s) => s.updateDiary)
  const { currentYear, currentWeekNumber, selectedDayIndex, setSelectedDay } =
    useUIStore()

  const dates = getWeekDates(currentYear, currentWeekNumber)
  const diary = weekData?.diary ?? {}
  const currentContent = diary[String(selectedDayIndex)]?.content ?? ''
  const today = new Date()
  const todayIndex = (today.getDay() + 6) % 7

  const handleContentChange = (content: string) => {
    updateDiary(selectedDayIndex, content)
  }

  return (
    <div className="p-4">
      <h3 className="text-[15px] font-[600] text-[#1e293b] mb-3">日记</h3>

      {/* 日期切换 */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {dates.map((date, i) => {
          const label = getDayLabel(date)
          const isActive = i === selectedDayIndex
          const isTodayDay = i === todayIndex

          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`px-2.5 py-1.5 rounded-lg text-[14px] font-[500] transition-colors ${
                isActive
                  ? 'bg-primary-500 text-white shadow-sm'
                  : isTodayDay
                  ? 'bg-primary-50 text-primary-600 border border-primary-200'
                  : 'bg-gray-50 text-[#64748b] hover:bg-gray-100 border border-transparent'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* 编辑器 */}
      <textarea
        value={currentContent}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder={`记录 ${getDayLabel(dates[selectedDayIndex])} 的所思所想...`}
        className="w-full h-64 text-[15px] font-[500] p-3 bg-white border border-[#dde3ee] rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-primary-400 focus:bg-white transition-colors leading-relaxed placeholder-[#94a3b8]"
      />
    </div>
  )
}
