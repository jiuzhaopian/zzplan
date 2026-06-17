import { useState } from 'react'
import type { Priority } from '../../types/task'
import { PRIORITY_CONFIG } from '../../types/task'

interface AddTaskButtonProps {
  dayIndex: number
  onAdd: (dayIndex: number, title: string, priority: Priority) => void
}

export default function AddTaskButton({ dayIndex, onAdd }: AddTaskButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')

  const handleSubmit = () => {
    if (title.trim()) {
      onAdd(dayIndex, title.trim(), priority)
      setTitle('')
      setPriority('medium')
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
      <div className="flex items-center gap-1.5 flex-wrap">
        {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[keyof typeof PRIORITY_CONFIG]][]).map(
          ([key, config]) => (
            <button
              key={key}
              onClick={() => setPriority(key)}
              className={`px-2 py-0.5 rounded-full text-[13px] font-[500] transition-colors ${
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
