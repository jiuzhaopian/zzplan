import { useState } from 'react'
import { useWeekStore } from '../../store/weekStore'
import { useUIStore } from '../../store/uiStore'
import { getWeekDates } from '../../utils/dateUtils'

export default function HabitTracker() {
  const weekData = useWeekStore((s) => s.weekData)
  const { addHabit, toggleHabitCheck, deleteHabit, updateHabitName } =
    useWeekStore()
  const { currentYear, currentWeekNumber } = useUIStore()
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const dates = getWeekDates(currentYear, currentWeekNumber)
  const habits = weekData?.habits ?? []
  const today = new Date()
  const todayIndex = (today.getDay() + 6) % 7

  const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

  const handleAdd = () => {
    if (newName.trim() && habits.length < 5) {
      addHabit(newName.trim())
      setNewName('')
      setIsAdding(false)
    }
  }

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      updateHabitName(editingId, editName.trim())
    }
    setEditingId(null)
    setEditName('')
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-[600] text-[#1e293b]">习惯打卡</h3>
        {habits.length < 5 && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="text-[14px] text-primary-500 hover:text-primary-600 font-[500]"
          >
            + 添加
          </button>
        )}
      </div>

      {/* 添加习惯表单 */}
      {isAdding && (
        <div className="mb-3 flex gap-1.5">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') {
                setNewName('')
                setIsAdding(false)
              }
            }}
            placeholder="习惯名称（如：运动、阅读）"
            maxLength={20}
            className="flex-1 text-[14px] font-[500] px-2 py-1.5 border border-primary-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400 placeholder-[#94a3b8]"
          />
          <button
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="px-3 py-1 text-[14px] font-[500] text-white bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 rounded-lg transition-colors"
          >
            确定
          </button>
        </div>
      )}

      {/* 周几标签头 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayLabels.map((label, i) => (
          <div
            key={i}
            className={`text-center text-[13px] font-[500] py-0.5 rounded ${
              i === todayIndex
                ? 'bg-primary-500 text-white'
                : 'text-[#64748b] bg-gray-50'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 习惯列表 */}
      {habits.length === 0 && (
        <div className="text-center py-8 text-[14px] text-[#94a3b8] font-[500]">
          还没有习惯，点击"+ 添加"开始
        </div>
      )}

      <div className="space-y-2">
        {habits.map((habit) => {
          const checkCount = Object.values(habit.checks).filter(Boolean).length
          const rate = Math.round((checkCount / 7) * 100)

          return (
            <div
              key={habit.id}
              className="bg-white rounded-xl p-2.5 border border-[#dde3ee] shadow-card"
            >
              <div className="flex items-center justify-between mb-1.5">
                {editingId === habit.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit()
                      if (e.key === 'Escape') {
                        setEditingId(null)
                        setEditName('')
                      }
                    }}
                    maxLength={20}
                    className="text-[14px] font-[500] px-1.5 py-0.5 border border-primary-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-400 flex-1 mr-2"
                  />
                ) : (
                  <span
                    className="text-[14px] font-[500] text-[#1e293b] cursor-pointer hover:text-primary-600 truncate flex-1"
                    onDoubleClick={() =>
                      handleStartEdit(habit.id, habit.name)
                    }
                    title="双击编辑名称"
                  >
                    {habit.name}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-[#64748b] font-[500]">
                    {checkCount}/7
                  </span>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="text-[13px] text-[#94a3b8] hover:text-red-400 transition-colors font-[500]"
                    title="删除习惯"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* 7天打卡格 */}
              <div className="grid grid-cols-7 gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                  <button
                    key={dayIndex}
                    onClick={() => toggleHabitCheck(habit.id, dayIndex)}
                    className={`aspect-square rounded-md text-[13px] font-[500] transition-all ${
                      habit.checks[dayIndex]
                        ? 'bg-primary-500 text-white shadow-sm shadow-primary-200'
                        : 'bg-white border border-[#dde3ee] text-[#94a3b8] hover:border-primary-300'
                    } ${dayIndex === todayIndex ? 'ring-1 ring-primary-300' : ''}`}
                    title={`${weekdayLabels[dayIndex]}: ${habit.checks[dayIndex] ? '已完成' : '未完成'}`}
                  >
                    {habit.checks[dayIndex] ? '✓' : ''}
                  </button>
                ))}
              </div>

              {/* 完成率进度条 */}
              <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
