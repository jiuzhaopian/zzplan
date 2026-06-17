import { useUIStore } from '../../store/uiStore'
import { getWeekLabel } from '../../utils/dateUtils'

export default function TopNavBar() {
  const {
    currentYear,
    currentWeekNumber,
    goToPrevWeek,
    goToNextWeek,
    goToToday,
    isDirty,
    deadlinePanelOpen,
    toggleDeadlinePanel,
  } = useUIStore()

  const weekLabel = getWeekLabel(currentYear, currentWeekNumber)

  return (
    <header className="h-12 bg-white border-b border-[#dde3ee] flex items-center justify-between px-4 shrink-0 select-none">
      {/* 左侧：周导航 */}
      <div className="flex items-center gap-3">
        <button
          onClick={goToPrevWeek}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#64748b] hover:text-[#1e293b] transition-colors"
          title="上一周"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[15px] font-[600] text-[#1e293b]">
            {currentYear}年 第{currentWeekNumber}周
          </span>
          <span className="text-[14px] text-[#64748b] hidden sm:inline font-[500]">
            {weekLabel}
          </span>
        </div>

        <button
          onClick={goToNextWeek}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#64748b] hover:text-[#1e293b] transition-colors"
          title="下一周"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 右侧辅助信息 */}
      <div className="flex items-center gap-3">
        {/* 保存状态指示 */}
        {isDirty && (
          <span className="text-[13px] text-amber-500 flex items-center gap-1 font-[500]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            未保存
          </span>
        )}

        {/* 今天按钮 */}
        <button
          onClick={goToToday}
          className="px-3 py-1.5 text-[14px] font-[500] text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
        >
          今天
        </button>

        {/* DDL 面板切换按钮 */}
        <button
          onClick={toggleDeadlinePanel}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-[500] transition-colors ${
            deadlinePanelOpen
              ? 'bg-[#1e293b] text-white'
              : 'text-[#64748b] hover:text-[#1e293b] hover:bg-gray-100'
          }`}
          title="DDL 截止日期"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6.5" />
            <path d="M8 4.5V8l2.5 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>DDL</span>
        </button>
      </div>
    </header>
  )
}
