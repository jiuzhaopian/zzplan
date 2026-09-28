import { useEffect, useRef } from 'react'
import { useWeekStore } from '../store/weekStore'
import { useUIStore } from '../store/uiStore'
import { persistWeekData } from '../services/persistence'

export function useAutoSave() {
  const weekData = useWeekStore((s) => s.weekData)
  const isDirty = useUIStore((s) => s.isDirty)
  const setDirty = useUIStore((s) => s.setDirty)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentWeekKeyRef = useRef<string | null>(null)

  // 首次加载或切周加载不标记 dirty；同一周的数据变更才需要保存。
  useEffect(() => {
    if (!weekData) return
    const weekKey = `${weekData.meta.year}-${weekData.meta.weekNumber}`
    if (currentWeekKeyRef.current !== weekKey) {
      currentWeekKeyRef.current = weekKey
      setDirty(false)
      return
    }
    setDirty(true)
  }, [weekData, setDirty])

  // debounce 500ms 自动保存
  useEffect(() => {
    if (!isDirty || !weekData) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      try {
        const result = await persistWeekData(weekData)
        if (result.success && useWeekStore.getState().weekData === weekData) {
          setDirty(false)
        } else {
          if (!result.success) console.error('自动保存失败:', result.error)
        }
      } catch (err) {
        console.error('自动保存异常:', err)
      }
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [weekData, isDirty, setDirty])
}
