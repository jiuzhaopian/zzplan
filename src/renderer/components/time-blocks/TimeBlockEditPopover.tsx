import { useState } from 'react'
import type { TimeBlock, BlockCategory } from '../../types/timeBlock'
import { CATEGORY_CONFIG } from '../../types/timeBlock'
import { useWeekStore } from '../../store/weekStore'

interface TimeBlockEditPopoverProps {
  block: TimeBlock
  hourHeight: number
  onClose: () => void
}

export default function TimeBlockEditPopover({
  block,
  hourHeight,
  onClose,
}: TimeBlockEditPopoverProps) {
  const { updateTimeBlock, deleteTimeBlock } = useWeekStore()
  const [title, setTitle] = useState(block.title)
  const [category, setCategory] = useState<BlockCategory>(block.category)

  const handleSave = () => {
    updateTimeBlock(block.id, { title: title.trim(), category })
    onClose()
  }

  const handleDelete = () => {
    deleteTimeBlock(block.id)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onClose()
  }

  // 弹窗定位
  const top = block.startHour * hourHeight + 10

  return (
    <div className="absolute left-2 right-2 z-20" style={{ top: `${top}px` }}>
      <div className="bg-white rounded-xl shadow-lg border border-[#dde3ee] p-3">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="时间块标题..."
          className="w-full text-[15px] font-[500] px-2 py-1.5 border border-[#dde3ee] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400 mb-2 placeholder-[#94a3b8]"
        />

        {/* 分类选择 */}
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {(Object.entries(CATEGORY_CONFIG) as [BlockCategory, typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG]][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className="px-2 py-0.5 rounded-full text-[13px] font-[500] transition-colors border"
                style={{
                  backgroundColor: category === key ? config.borderColor : 'transparent',
                  color: category === key ? '#fff' : config.textColor,
                  borderColor: config.borderColor,
                }}
              >
                {config.label}
              </button>
            )
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="text-[13px] font-[500] text-red-500 hover:text-red-600"
          >
            删除
          </button>
          <div className="flex gap-1.5">
            <button
              onClick={onClose}
              className="px-2 py-1 text-[13px] font-[500] text-[#64748b] hover:text-[#1e293b]"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-[13px] font-[500] text-white bg-primary-500 hover:bg-primary-600 rounded-md transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
