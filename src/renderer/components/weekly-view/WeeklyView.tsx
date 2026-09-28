import { useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useWeekStore } from '../../store/weekStore'
import { useUIStore } from '../../store/uiStore'
import { getWeekDates } from '../../utils/dateUtils'
import DayColumn from './DayColumn'

export default function WeeklyView() {
  const weekData = useWeekStore((s) => s.weekData)
  const { currentYear, currentWeekNumber } = useUIStore()
  const moveTask = useWeekStore((s) => s.moveTask)
  const reorderTasks = useWeekStore((s) => s.reorderTasks)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 移动 5px 后才激活拖拽，避免误触
      },
    })
  )

  if (!weekData) return null

  const dates = getWeekDates(currentYear, currentWeekNumber)
  const today = new Date()

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over) return

      const taskId = active.id as string
      const task = weekData.tasks.find((t) => t.id === taskId)
      if (!task) return

      // 判断拖到了哪个天
      let targetDayIndex: number

      // over.id 可能是 "day-{dayIndex}" (droppable) 或 task.id (sortable)
      if (typeof over.id === 'string' && over.id.startsWith('day-')) {
        targetDayIndex = parseInt(over.id.replace('day-', ''), 10)
      } else {
        // 放到了另一个 task 上，获取那个 task 的 dayIndex
        const overTask = weekData.tasks.find((t) => t.id === over.id)
        if (overTask) {
          targetDayIndex = overTask.dayIndex
        } else {
          return
        }
      }

      const overTask = weekData.tasks.find((t) => t.id === over.id)
      const sourceIds = weekData.tasks
        .filter((t) => t.dayIndex === task.dayIndex)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((t) => t.id)

      if (task.dayIndex === targetDayIndex && overTask) {
        const oldIndex = sourceIds.indexOf(taskId)
        const newIndex = sourceIds.indexOf(overTask.id)
        if (oldIndex !== newIndex) {
          reorderTasks(targetDayIndex, arrayMove(sourceIds, oldIndex, newIndex))
        }
        return
      }

      moveTask(taskId, targetDayIndex)

      if (overTask) {
        const targetIds = weekData.tasks
          .filter((t) => t.dayIndex === targetDayIndex && t.id !== taskId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((t) => t.id)
        const insertAt = targetIds.indexOf(overTask.id)
        targetIds.splice(insertAt, 0, taskId)
        reorderTasks(targetDayIndex, targetIds)
      }
    },
    [weekData, moveTask, reorderTasks]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-7 gap-2 h-full">
        {dates.map((date, index) => {
          const dayTasks = weekData.tasks
            .filter((t) => t.dayIndex === index)
            .sort((a, b) => a.sortOrder - b.sortOrder)

          const isToday =
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()

          return (
            <DayColumn
              key={index}
              dayIndex={index}
              date={date}
              isToday={isToday}
              tasks={dayTasks}
            />
          )
        })}
      </div>
    </DndContext>
  )
}
