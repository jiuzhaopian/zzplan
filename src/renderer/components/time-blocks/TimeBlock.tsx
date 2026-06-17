import type { TimeBlock } from '../../types/timeBlock'
import { CATEGORY_CONFIG } from '../../types/timeBlock'

interface TimeBlockItemProps {
  block: TimeBlock
  hourHeight: number
  onClick: () => void
}

export default function TimeBlockItem({
  block,
  hourHeight,
  onClick,
}: TimeBlockItemProps) {
  const config = CATEGORY_CONFIG[block.category]
  const top = block.startHour * hourHeight
  const height = (block.endHour - block.startHour) * hourHeight

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="absolute left-1 right-1 rounded-lg border-l-[3px] px-2 py-1 cursor-pointer overflow-hidden hover:shadow-md hover:z-10 transition-shadow"
      style={{
        top: `${top}px`,
        height: `${height}px`,
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
        color: config.textColor,
      }}
    >
      <div className="text-[13px] font-[500] truncate leading-tight">
        {block.title || '（无标题）'}
      </div>
      <div className="text-[13px] font-[500] mt-0.5" style={{ color: config.textColor, opacity: 0.7 }}>
        {formatHour(block.startHour)} - {formatHour(block.endHour)}
      </div>
    </div>
  )
}

function formatHour(hour: number): string {
  const h = Math.floor(hour)
  const m = Math.round((hour - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}
