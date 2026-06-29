import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task } from '../../types/task'
import { useWeekStore } from '../../store/weekStore'
import DayHeader from './DayHeader'
import SortableTaskCard from './SortableTaskCard'
import AddTaskButton from './AddTaskButton'

interface DayColumnProps {
  dayIndex: number
  date: Date
  isToday: boolean
  tasks: Task[]
}

export default function DayColumn({
  dayIndex,
  date,
  isToday,
  tasks,
}: DayColumnProps) {
  const { toggleTask, updateTaskTitle, updateTaskPriority, updateTaskTimeOfDay, deleteTask, addTask } =
    useWeekStore()

  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayIndex}`,
  })

  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-xl p-2 min-h-0 transition-colors border ${
        isOver
          ? 'bg-primary-50/80 ring-2 ring-primary-300 ring-dashed border-primary-300'
          : isToday
          ? 'bg-primary-50/60 ring-1 ring-primary-200/50 border-primary-200'
          : 'bg-white/80 border-[#dde3ee]'
      }`}
    >
      <DayHeader date={date} isToday={isToday} />

      {/* 任务列表（可排序拖拽） */}
      <div className="flex-1 overflow-auto space-y-1.5 mt-1 pr-0.5">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onEdit={updateTaskTitle}
              onDelete={deleteTask}
              onPriorityChange={updateTaskPriority}
              onTimeOfDayChange={updateTaskTimeOfDay}
            />
          ))}
        </SortableContext>

        {/* 空状态提示 */}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-16 text-[14px] text-[#94a3b8] select-none font-[500]">
            拖拽任务到此处
          </div>
        )}
      </div>

      {/* 添加任务按钮 */}
      <AddTaskButton dayIndex={dayIndex} onAdd={addTask} />
    </div>
  )
}
