import { useRef, useState, useCallback } from 'react'
import type { TimeBlock, BlockCategory } from '../../types/timeBlock'
import TimeBlockItem from './TimeBlock'
import TimeBlockEditPopover from './TimeBlockEditPopover'
import { useWeekStore } from '../../store/weekStore'

interface TimeDayColumnProps {
  dayIndex: number
  date: Date
  isToday: boolean
  blocks: TimeBlock[]
  hourHeight: number
  totalHeight: number
}

export default function TimeDayColumn({
  dayIndex,
  date,
  isToday,
  blocks,
  hourHeight,
  totalHeight,
}: TimeDayColumnProps) {
  const addTimeBlock = useWeekStore((s) => s.addTimeBlock)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [dragCurrent, setDragCurrent] = useState<number | null>(null)
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const y = e.clientY - rect.top + containerRef.current.scrollTop

      // 吸附到 30 分钟
      const rawHour = y / hourHeight
      const snappedHour = Math.round(rawHour * 2) / 2

      setDragStart(snappedHour)
      setDragCurrent(snappedHour)
      setIsCreating(true)
    },
    [hourHeight]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isCreating || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const y = e.clientY - rect.top + containerRef.current.scrollTop
      const rawHour = y / hourHeight
      const snappedHour = Math.round(rawHour * 2) / 2
      setDragCurrent(Math.max(0, Math.min(24, snappedHour)))
    },
    [isCreating, hourHeight]
  )

  const handleMouseUp = useCallback(() => {
    if (isCreating && dragStart !== null && dragCurrent !== null) {
      const startHour = Math.min(dragStart, dragCurrent)
      const endHour = Math.max(dragStart, dragCurrent)

      // 最小 30 分钟
      if (endHour - startHour >= 0.5) {
        addTimeBlock(dayIndex, '', 'work', startHour, endHour)
      }
    }
    setIsCreating(false)
    setDragStart(null)
    setDragCurrent(null)
  }, [isCreating, dragStart, dragCurrent, dayIndex, addTimeBlock])

  const dayLabel =
    date.getMonth() + 1 + '/' + date.getDate()

  return (
    <div
      className={`relative border-r border-[#e2e8f0] last:border-r-0 ${
        isToday ? 'bg-primary-50/30' : ''
      }`}
    >
      {/* 日期头 */}
      <div className="sticky top-0 z-10 bg-inherit text-center py-1 border-b border-[#e2e8f0]">
        <span className="text-[13px] text-[#64748b] font-[500]">
          {dayLabel}
        </span>
      </div>

      {/* 时间块列（可交互层） */}
      <div
        ref={containerRef}
        className="relative"
        style={{ height: `${totalHeight}px` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          if (isCreating) {
            setIsCreating(false)
            setDragStart(null)
            setDragCurrent(null)
          }
        }}
      >
        {/* 半小时网格线 */}
        {Array.from({ length: 48 }, (_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-[#e2e8f0] pointer-events-none"
            style={{ top: `${i * (hourHeight / 2)}px` }}
          />
        ))}
        {/* 整点线更明显 */}
        {Array.from({ length: 24 }, (_, i) => (
          <div
            key={'h' + i}
            className="absolute left-0 right-0 border-t border-[#e2e8f0] pointer-events-none"
            style={{
              top: `${i * hourHeight}px`,
              borderTopWidth: '1px',
              borderTopStyle: 'solid',
            }}
          />
        ))}

        {/* 已存在的时间块 */}
        {blocks.map((block) => (
          <TimeBlockItem
            key={block.id}
            block={block}
            hourHeight={hourHeight}
            onClick={() => setEditingBlockId(block.id)}
          />
        ))}

        {/* 编辑弹窗 */}
        {editingBlockId && (
          <TimeBlockEditPopover
            block={blocks.find((b) => b.id === editingBlockId)!}
            hourHeight={hourHeight}
            onClose={() => setEditingBlockId(null)}
          />
        )}

        {/* 正在创建的时间块预览 */}
        {isCreating && dragStart !== null && dragCurrent !== null && (
          <div
            className="absolute left-1 right-1 rounded-lg bg-primary-200/40 border border-primary-400/50 pointer-events-none"
            style={{
              top: `${Math.min(dragStart, dragCurrent) * hourHeight}px`,
              height: `${Math.abs(dragCurrent - dragStart) * hourHeight}px`,
            }}
          />
        )}
      </div>
    </div>
  )
}
