'use client'

import { useState } from 'react'
import AIChatPanel from './AIChatPanel'

export default function ChatButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating button — bottom left above sidebar */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 left-[13.5rem] z-40 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
          open
            ? 'bg-teal text-white rotate-0'
            : 'bg-bg-elevated border border-teal/30 text-teal hover:bg-teal/10'
        }`}
        title="Kleo AI Chat"
      >
        <span className="text-xl">{open ? '×' : '✦'}</span>
      </button>

      <AIChatPanel open={open} onClose={() => setOpen(false)} />
    </>
  )
}
