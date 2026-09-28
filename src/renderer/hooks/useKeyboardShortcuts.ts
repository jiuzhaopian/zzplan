import { useEffect } from 'react'
import { useWeekStore } from '../store/weekStore'
import { useUIStore } from '../store/uiStore'
import { showToast } from '../components/shared/Toast'
import { persistWeekData } from '../services/persistence'

export function useKeyboardShortcuts() {
  useEffect(() => {
    let closeInProgress = false

    async function saveCurrentWeek(showSuccess: boolean): Promise<boolean> {
      const weekData = useWeekStore.getState().weekData
      if (!weekData) return true

      try {
        const result = await persistWeekData(weekData)
        if (!result.success) {
          showToast('error', '保存失败: ' + (result.error || '未知错误'))
          return false
        }
        if (useWeekStore.getState().weekData === weekData) {
          useUIStore.getState().setDirty(false)
        }
        if (showSuccess) showToast('success', '已保存')
        return true
      } catch {
        showToast('error', '保存失败，请重试')
        return false
      }
    }

    function handler(e: KeyboardEvent) {

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

    const removeSaveListener = window.electronAPI.onSaveRequested(() => {
      void saveCurrentWeek(true)
    })
    const removeCloseListener = window.electronAPI.onBeforeClose(async () => {
      if (closeInProgress) return
      closeInProgress = true

      try {
        const weekSaved = await saveCurrentWeek(false)
        const deadlinesResult = await window.electronAPI.saveDeadlines(
          useWeekStore.getState().deadlines
        )
        if (weekSaved && deadlinesResult.success) {
          window.electronAPI.signalReadyToClose()
          return
        }
        if (!deadlinesResult.success) {
          showToast('error', '截止日期保存失败，窗口未关闭')
        }
      } catch {
        showToast('error', '关闭前保存失败，窗口未关闭')
      } finally {
        closeInProgress = false
      }
    })
    window.electronAPI.signalCloseGuardReady()

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      removeSaveListener()
      removeCloseListener()
    }
  }, [])
}
