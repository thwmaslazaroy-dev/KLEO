'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
}

const styles: Record<ToastType, string> = {
  success: 'border-teal/30 text-teal',
  error: 'border-coral/30 text-coral',
  info: 'border-white/20 text-white',
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 200)
    }, duration)
    return () => clearTimeout(t)
  }, [duration, onClose])

  return (
    <div
      className={clsx(
        'flex items-center gap-3 bg-bg-elevated border rounded-xl px-4 py-3 text-sm transition-all',
        styles[type],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      <span className="font-bold text-xs w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0">
        {icons[type]}
      </span>
      {message}
    </div>
  )
}
