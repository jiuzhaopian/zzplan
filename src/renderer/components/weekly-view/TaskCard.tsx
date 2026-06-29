import { useState } from 'react'
import type { Task, Priority, TimeOfDay } from '../../types/task'
import { PRIORITY_CONFIG, TIME_OF_DAY_CONFIG } from '../../types/task'

interface TaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onDelete: (id: string) => void
  onPriorityChange: (id: string, priority: Priority) => void
  onTimeOfDayChange: (id: string, timeOfDay: TimeOfDay | undefined) => void
}

export default function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onPriorityChange,
  onTimeOfDayChange,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [showMenu, setShowMenu] = useState(false)

  const priorityConfig = PRIORITY_CONFIG[task.priority]
  const timeOfDayConfig = task.timeOfDay ? TIME_OF_DAY_CONFIG[task.timeOfDay] : null

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onEdit(task.id, editTitle.trim())
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit()
    if (e.key === 'Escape') {
      setEditTitle(task.title)
      setIsEditing(false)
    }
  }

  return (
    <div
      className={`group relative flex items-start gap-2 px-2.5 py-2 rounded-lg bg-white border border-[#dde3ee] shadow-card hover:shadow-card-hover hover:border-gray-300 transition-all cursor-default ${
        task.completed ? 'opacity-70' : ''
      }`}
    >
      {/* 完成复选框 */}
      <button
        onClick={() => onToggle(task.id)}
        className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          task.completed
            ? 'bg-primary-500 border-primary-500'
            : 'border-gray-300 hover:border-primary-400'
        }`}
      >
        {task.completed && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* 内容 */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            className="w-full text-[15px] font-[500] px-1.5 py-0.5 border border-primary-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
        ) : (
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            <span
              className={`text-[15px] font-[500] leading-relaxed cursor-text truncate ${
                task.completed ? 'task-completed' : 'text-[#1e293b]'
              }`}
              onClick={() => setIsEditing(true)}
            >
              {task.title}
            </span>
            {/* 时间段标签 */}
            {timeOfDayConfig && (
              <span
                className="inline-flex items-center px-1.5 py-px rounded-full text-[11px] leading-none font-[500] shrink-0"
                style={{
                  backgroundColor: timeOfDayConfig.bgColor,
                  color: timeOfDayConfig.color,
                }}
              >
                {timeOfDayConfig.label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 优先级指示器 + 点击弹出菜单 */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
          style={{ backgroundColor: priorityConfig.color }}
          title={`优先级: ${priorityConfig.label}`}
        />
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-5 z-20 w-36 bg-white rounded-lg shadow-lg border border-[#dde3ee] py-1">
              {/* 优先级 */}
              <div className="px-3 py-1 text-[11px] text-[#94a3b8] font-[500]">优先级</div>
              {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof priorityConfig][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onPriorityChange(task.id, key)
                      setShowMenu(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-[14px] font-[500] hover:bg-gray-50 ${
                      key === task.priority ? 'font-[600] text-primary-600' : 'text-[#1e293b]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    {config.label}
                  </button>
                )
              )}
              <hr className="my-1 border-[#dde3ee]" />
              {/* 时间段 */}
              <div className="px-3 py-1 text-[11px] text-[#94a3b8] font-[500]">时段</div>
              <button
                onClick={() => {
                  onTimeOfDayChange(task.id, undefined)
                  setShowMenu(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-[14px] font-[500] hover:bg-gray-50 ${
                  !task.timeOfDay ? 'font-[600] text-primary-600' : 'text-[#1e293b]'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" />
                无
              </button>
              {(Object.entries(TIME_OF_DAY_CONFIG) as [TimeOfDay, typeof TIME_OF_DAY_CONFIG[keyof typeof TIME_OF_DAY_CONFIG]][]).map(
                ([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {
                      onTimeOfDayChange(task.id, key)
                      setShowMenu(false)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-[14px] font-[500] hover:bg-gray-50 ${
                      key === task.timeOfDay ? 'font-[600] text-primary-600' : 'text-[#1e293b]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    {config.label}
                  </button>
                )
              )}
              <hr className="my-1 border-[#dde3ee]" />
              <button
                onClick={() => {
                  onDelete(task.id)
                  setShowMenu(false)
                }}
                className="w-full text-left px-3 py-1.5 text-[14px] font-[500] text-red-500 hover:bg-red-50"
              >
                删除任务
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
