import { useEffect } from 'react'

type ToastProps = {
  message: string
  type?: 'success' | 'error' | 'info'
  onClose: () => void
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => {
    // Автоматически скрываем уведомление через несколько секунд
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-slate-700',
  }

  return (
    <div
      className={`fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-2`}
      role="alert"
    >
      {message}
    </div>
  )
}
