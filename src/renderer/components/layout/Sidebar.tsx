import { useUIStore } from '../../store/uiStore'
import HabitTracker from '../sidebar/HabitTracker'
import DiaryEditor from '../sidebar/DiaryEditor'
import WeeklyReview from '../sidebar/WeeklyReview'

export default function Sidebar() {
  const { sidebarTab, setSidebarTab } = useUIStore()

  const tabs = [
    { key: 'habits' as const, label: '习惯' },
    { key: 'diary' as const, label: '日记' },
    { key: 'review' as const, label: '复盘' },
  ]

  return (
    <aside className="w-80 bg-[#f8fafc] border-l border-[#dde3ee] flex flex-col shrink-0 overflow-hidden">
      {/* 标签页切换 */}
      <div className="flex border-b border-[#dde3ee] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSidebarTab(tab.key)}
            className={`flex-1 py-2.5 text-[14px] font-[500] transition-colors ${
              sidebarTab === tab.key
                ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
                : 'text-[#64748b] hover:text-[#1e293b] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto">
        {sidebarTab === 'habits' && <HabitTracker />}
        {sidebarTab === 'diary' && <DiaryEditor />}
        {sidebarTab === 'review' && <WeeklyReview />}
      </div>
    </aside>
  )
}
