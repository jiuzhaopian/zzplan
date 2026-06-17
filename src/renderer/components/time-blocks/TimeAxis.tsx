interface TimeAxisProps {
  hourHeight: number
}

export default function TimeAxis({ hourHeight }: TimeAxisProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="w-12 shrink-0 border-r border-[#e2e8f0] select-none">
      {/* 顶部空白占位 */}
      <div style={{ height: `${hourHeight / 2}px` }} />

      {hours.map((hour) => (
        <div
          key={hour}
          className="relative flex items-start justify-end pr-2"
          style={{ height: `${hourHeight}px` }}
        >
          <span className="text-[13px] text-[#475569] font-[500] -mt-2">
            {hour.toString().padStart(2, '0')}:00
          </span>
        </div>
      ))}
    </div>
  )
}
