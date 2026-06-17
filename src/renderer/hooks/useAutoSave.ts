import { useEffect, useRef } from 'react'
import { useWeekStore } from '../store/weekStore'
import { useUIStore } from '../store/uiStore'

export function useAutoSave() {
  const weekData = useWeekStore((s) => s.weekData)
  const isDirty = useUIStore((s) => s.isDirty)
  const setDirty = useUIStore((s) => s.setDirty)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savingRef = useRef(false)
  const isFirstLoad = useRef(true)

  // 首次加载时跳过标记 dirty
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      return
    }
    if (weekData) {
      setDirty(true)
    }
  }, [weekData, setDirty])

  // debounce 500ms 自动保存
  useEffect(() => {
    if (!isDirty || !weekData) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      if (savingRef.current) return
      savingRef.current = true

      try {
        const result = await window.electronAPI.saveWeek(
          weekData.meta.year,
          weekData.meta.weekNumber,
          {
            ...weekData,
            meta: { ...weekData.meta, updatedAt: new Date().toISOString() },
          }
        )
        if (result.success) {
          setDirty(false)
        } else {
          console.error('自动保存失败:', result.error)
        }
      } catch (err) {
        console.error('自动保存异常:', err)
      } finally {
        savingRef.current = false
      }
    }, 500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [weekData, isDirty, setDirty])
}
