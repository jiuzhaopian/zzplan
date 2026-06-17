import { useState, useEffect, useMemo } from 'react'
import { useWeekStore } from '../../store/weekStore'
import { useUIStore } from '../../store/uiStore'

export default function DeadlinePanel() {
  const deadlines = useWeekStore((s) => s.deadlines)
  const addDeadline = useWeekStore((s) => s.addDeadline)
  const toggleDeadline = useWeekStore((s) => s.toggleDeadline)
  const deleteDeadline = useWeekStore((s) => s.deleteDeadline)
  const deadlinePanelOpen = useUIStore((s) => s.deadlinePanelOpen)
  const toggleDeadlinePanel = useUIStore((s) => s.toggleDeadlinePanel)

  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

  // 排序：未完成在前 → 按日期升序
  const sortedDeadlines = useMemo(
    () =>
      [...deadlines].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return a.date.localeCompare(b.date)
      }),
    [deadlines]
  )

  // Esc 关闭
  useEffect(() => {
    if (!deadlinePanelOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleDeadlinePanel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [deadlinePanelOpen, toggleDeadlinePanel])

  // 添加截止日期
  const handleAdd = () => {
    if (!newTitle.trim() || !newDate) return
    addDeadline(newTitle.trim(), newDate, newTime || undefined)
    setNewTitle('')
    setNewDate('')
    setNewTime('')
  }

  if (!deadlinePanelOpen) return null

  const canAdd = newTitle.trim() && newDate

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 z-30 bg-black/10 transition-opacity duration-300"
        onClick={toggleDeadlinePanel}
      />

      {/* 滑出面板 */}
      <div
        className={`fixed right-0 top-12 z-40 w-[320px] h-[calc(100vh-48px)] bg-white border-l border-[#dde3ee] shadow-lg flex flex-col transition-transform duration-300 ease-in-out ${
          deadlinePanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 h-12 border-b border-[#dde3ee] shrink-0">
          <h2 className="text-[15px] font-[600] text-[#1e293b] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#64748b]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 4.5V8l2.5 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            DDL 截止日期
          </h2>
          <button
            onClick={toggleDeadlinePanel}
            className="text-[#64748b] hover:text-[#1e293b] transition-colors p-1 rounded hover:bg-gray-100"
            aria-label="关闭面板"
          >
            <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 3l8 8M11 3l-8 8" />
            </svg>
          </button>
        </div>

        {/* 添加表单 */}
        <div className="px-4 py-3 border-b border-[#dde3ee] space-y-2 shrink-0">
          <div className="flex gap-2">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 text-[14px] font-[500] px-2 py-1.5 border border-[#dde3ee] rounded-md text-[#1e293b] focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-[90px] text-[14px] font-[500] px-2 py-1.5 border border-[#dde3ee] rounded-md text-[#1e293b] focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="截止日期描述..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
              }}
              className="flex-1 text-[15px] font-[500] px-2 py-1.5 border border-[#dde3ee] rounded-md text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
            <button
              onClick={handleAdd}
              disabled={!canAdd}
              className="px-3 py-1.5 text-[14px] font-[500] text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 rounded-md transition-colors shrink-0"
            >
              添加
            </button>
          </div>
        </div>

        {/* 截止日期列表 */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
          {sortedDeadlines.length === 0 && (
            <div className="text-center py-12 text-[14px] text-[#94a3b8] font-[500]">
              <svg className="w-8 h-8 mx-auto mb-2 text-[#cbd5e1]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 4.5V8l2.5 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              本周暂无截止日期
            </div>
          )}

          {sortedDeadlines.map((deadline) => {
            // 格式化日期显示 MM-DD
            const displayDate = deadline.date.slice(5)

            return (
              <div
                key={deadline.id}
                className={`flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group ${
                  deadline.completed ? 'opacity-70' : ''
                }`}
              >
                {/* 完成复选框 */}
                <button
                  onClick={() => toggleDeadline(deadline.id)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    deadline.completed
                      ? 'bg-primary-500 border-primary-500'
                      : 'border-[#dde3ee] hover:border-primary-400'
                  }`}
                >
                  {deadline.completed && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* 标题 */}
                <span
                  className={`flex-1 text-[15px] font-[500] truncate ${
                    deadline.completed
                      ? 'line-through text-[#94a3b8]'
                      : 'text-[#1e293b]'
                  }`}
                >
                  {deadline.title}
                </span>

                {/* 日期 */}
                <span className="text-[13px] text-[#64748b] font-[500] shrink-0">
                  {displayDate}
                </span>

                {/* 时间（如有） */}
                {deadline.time && (
                  <span className="text-[13px] text-[#64748b] font-[500] shrink-0">
                    {deadline.time}
                  </span>
                )}

                {/* 删除按钮 */}
                <button
                  onClick={() => deleteDeadline(deadline.id)}
                  className="text-[#94a3b8] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 p-0.5"
                  aria-label="删除截止日期"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 3l8 8M11 3l-8 8" />
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
