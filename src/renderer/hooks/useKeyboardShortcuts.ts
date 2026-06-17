import { useEffect } from 'react'
import { useWeekStore } from '../store/weekStore'
import { useUIStore } from '../store/uiStore'
import { showToast } from '../components/shared/Toast'

export function useKeyboardShortcuts() {
  useEffect(() => {
    async function handler(e: KeyboardEvent) {
      // Cmd/Ctrl + S: 立即保存
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        const weekData = useWeekStore.getState().weekData
        if (weekData) {
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
              useUIStore.getState().setDirty(false)
              showToast('success', '已保存')
            } else {
              showToast('error', '保存失败: ' + (result.error || '未知错误'))
            }
          } catch (err) {
            showToast('error', '保存失败，请重试')
          }
        }
      }

      // Escape: 关闭弹窗
      if (e.key === 'Escape') {
        const activeElement = document.activeElement
        if (
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement
        ) {
          activeElement.blur()
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
