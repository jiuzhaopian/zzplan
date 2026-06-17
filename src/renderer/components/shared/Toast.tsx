import { useEffect, useState, useCallback } from 'react'

interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

let toastListeners: Array<(toast: ToastMessage) => void> = []
let toastId = 0

/** 显示 Toast 通知（可在任何地方调用） */
export function showToast(type: ToastMessage['type'], message: string) {
  const toast: ToastMessage = { id: String(++toastId), type, message }
  toastListeners.forEach((fn) => fn(toast))
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((toast: ToastMessage) => {
    setToasts((prev) => [...prev, toast])
    // 3秒后自动移除
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id))
    }, 3000)
  }, [])

  useEffect(() => {
    toastListeners.push(addToast)
    return () => {
      toastListeners = toastListeners.filter((fn) => fn !== addToast)
    }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const bgColor =
          toast.type === 'success'
            ? 'bg-green-500'
            : toast.type === 'error'
            ? 'bg-red-500'
            : 'bg-primary-500'

        return (
          <div
            key={toast.id}
            className={`${bgColor} text-white text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-slide-up pointer-events-auto`}
            style={{
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            {toast.type === 'success' && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        )
      })}
    </div>
  )
}
