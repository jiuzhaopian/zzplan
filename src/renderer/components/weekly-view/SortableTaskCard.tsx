import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, Priority, TimeOfDay } from '../../types/task'
import TaskCard from './TaskCard'

interface SortableTaskCardProps {
  task: Task
  onToggle: (id: string) => void
  onEdit: (id: string, title: string) => void
  onDelete: (id: string) => void
  onPriorityChange: (id: string, priority: Priority) => void
  onTimeOfDayChange: (id: string, timeOfDay: TimeOfDay | undefined) => void
}

export default function SortableTaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onPriorityChange,
  onTimeOfDayChange,
}: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard
        task={task}
        onToggle={onToggle}
        onEdit={onEdit}
        onDelete={onDelete}
        onPriorityChange={onPriorityChange}
        onTimeOfDayChange={onTimeOfDayChange}
      />
    </div>
  )
}
