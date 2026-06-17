import { useUIStore } from '../../store/uiStore'
import WeeklyView from '../weekly-view/WeeklyView'
import TimeBlockView from '../time-blocks/TimeBlockView'

export default function MainArea() {
  const { mainAreaSplitRatio, timeBlockExpanded, setTimeBlockExpanded } =
    useUIStore()

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* 周视图（上半部分） */}
      <div
        className="overflow-auto"
        style={{ height: timeBlockExpanded ? `${mainAreaSplitRatio * 100}%` : '100%' }}
      >
        <div className="min-w-[840px] h-full p-4">
          <WeeklyView />
        </div>
      </div>

      {/* 分割线 + 展开/收起按钮 */}
      {timeBlockExpanded && (
        <>
          <div className="flex items-center justify-center h-1 bg-[#e2e8f0] hover:bg-primary-300 cursor-row-resize group transition-colors">
            <button
              onClick={() => setTimeBlockExpanded(false)}
              className="absolute z-10 px-2 py-0.5 text-[13px] text-[#64748b] hover:text-[#1e293b] bg-white border border-[#dde3ee] rounded-full shadow-card opacity-0 group-hover:opacity-100 transition-opacity font-[500]"
              title="收起时间块"
            >
              收起时间块 ▲
            </button>
          </div>

          <div
            className="overflow-auto"
            style={{ height: `${(1 - mainAreaSplitRatio) * 100}%` }}
          >
            <div className="min-w-[840px] h-full p-4">
              <TimeBlockView />
            </div>
          </div>
        </>
      )}

      {/* 时间块视图已收起时显示展开按钮 */}
      {!timeBlockExpanded && (
        <button
          onClick={() => setTimeBlockExpanded(true)}
          className="mx-4 mb-2 py-1 text-[14px] text-[#64748b] hover:text-primary-600 hover:bg-primary-50 rounded-lg border border-dashed border-[#dde3ee] transition-colors font-[500]"
        >
          展开时间块规划 ▼
        </button>
      )}
    </main>
  )
}
