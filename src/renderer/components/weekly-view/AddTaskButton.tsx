import { useState } from 'react'
import type { Priority, TimeOfDay } from '../../types/task'
import { PRIORITY_CONFIG, TIME_OF_DAY_CONFIG } from '../../types/task'

interface AddTaskButtonProps {
  dayIndex: number
  onAdd: (dayIndex: number, title: string, priority: Priority, timeOfDay?: TimeOfDay) => void
}

export default function AddTaskButton({ dayIndex, onAdd }: AddTaskButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | undefined>(undefined)

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(dayIndex, title.trim(), priority, timeOfDay)
      setTitle('')
      setPriority('medium')
      setTimeOfDay(undefined)
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') {
      setTitle('')
      setIsAdding(false)
    }
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full mt-1 py-1.5 text-[14px] font-[500] text-[#64748b] hover:text-primary-500 hover:bg-primary-50/50 rounded-lg border border-dashed border-transparent hover:border-primary-200 transition-all"
      >
        + 添加任务
      </button>
    )
  }

  return (
    <div className="mt-1 p-2 bg-white rounded-lg border border-primary-200 shadow-card">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入任务标题..."
        className="w-full text-[15px] font-[500] px-2 py-1.5 border border-[#dde3ee] rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400 mb-2 placeholder-[#94a3b8]"
      />
      {/* 优先级 */}
      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
        {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[keyof typeof PRIORITY_CONFIG]][]).map(
          ([key, config]) => (
            <button
              key={key}
              onClick={() => setPriority(key)}
              className={`px-2 py-1 rounded-full text-[13px] font-[500] transition-colors ${
                priority === key
                  ? 'text-white'
                  : 'text-[#64748b] hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: priority === key ? config.color : 'transparent',
              }}
            >
              {config.label}
            </button>
          )
        )}
      </div>
      {/* 时间段 */}
      <div className="flex items-center gap-1 mb-2">
        <span className="text-[11px] text-[#94a3b8] mr-1">时段</span>
        <button
          onClick={() => setTimeOfDay(undefined)}
          className={`px-2 py-1 rounded-full text-[13px] font-[500] transition-colors ${
            timeOfDay === undefined
              ? 'text-white bg-[#64748b]'
              : 'text-[#64748b] hover:bg-gray-100'
          }`}
        >
          无
        </button>
        {(Object.entries(TIME_OF_DAY_CONFIG) as [TimeOfDay, typeof TIME_OF_DAY_CONFIG[keyof typeof TIME_OF_DAY_CONFIG]][]).map(
          ([key, config]) => (
            <button
              key={key}
              onClick={() => setTimeOfDay(timeOfDay === key ? undefined : key)}
              className={`px-2 py-1 rounded-full text-[13px] font-[500] transition-colors ${
                timeOfDay === key
                  ? 'text-white'
                  : 'text-[#64748b] hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: timeOfDay === key ? config.color : 'transparent',
              }}
            >
              {config.label}
            </button>
          )
        )}
      </div>
      {/* 操作按钮 */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1" />
        <button
          onClick={() => {
            setTitle('')
            setIsAdding(false)
          }}
          className="px-2 py-0.5 text-[13px] font-[500] text-[#64748b] hover:text-[#1e293b]"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="px-2.5 py-0.5 text-[13px] font-[500] text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 rounded-md transition-colors"
        >
          添加
        </button>
      </div>
    </div>
  )
}
