'use client'

import { useEffect } from 'react'
import { clsx } from 'clsx'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={clsx(
          'relative w-full bg-bg-elevated rounded-2xl border border-white/10 p-6 animate-slide-up',
          sizes[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-muted hover:text-white transition text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
