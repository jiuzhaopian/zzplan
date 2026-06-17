import { useEffect } from 'react'
import { useUIStore } from './store/uiStore'
import { useWeekStore } from './store/weekStore'
import { useAutoSave } from './hooks/useAutoSave'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import TopNavBar from './components/layout/TopNavBar'
import MainArea from './components/layout/MainArea'
import Sidebar from './components/layout/Sidebar'
import ToastContainer from './components/shared/Toast'
import DeadlinePanel from './components/deadline/DeadlinePanel'

export default function App() {
  const { currentYear, currentWeekNumber } = useUIStore()
  const loadWeek = useWeekStore((s) => s.loadWeek)
  const isLoading = useWeekStore((s) => s.isLoading)
  const loadGlobalDeadlines = useWeekStore((s) => s.loadGlobalDeadlines)

  // 初始化加载本周数据 + 全局 DDL
  useEffect(() => {
    loadWeek(currentYear, currentWeekNumber)
    loadGlobalDeadlines()
  }, [currentYear, currentWeekNumber, loadWeek, loadGlobalDeadlines])

  // 自动保存
  useAutoSave()

  // 键盘快捷键
  useKeyboardShortcuts()

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#eef2f7]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[15px] text-[#64748b] font-[500]">加载中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#eef2f7] overflow-hidden">
      <TopNavBar />
      <div className="flex-1 flex overflow-hidden">
        <MainArea />
        <Sidebar />
      </div>
      <DeadlinePanel />
      <ToastContainer />
    </div>
  )
}
