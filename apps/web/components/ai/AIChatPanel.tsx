'use client'

import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatPanelProps {
  open: boolean
  onClose: () => void
}

export default function AIChatPanel({ open, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.data ?? 'Κάτι πήγε στραβά.' },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Δεν μπορώ να συνδεθώ τώρα.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-bg border-l border-white/5 flex flex-col z-30 animate-slide-up">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-teal text-sm font-medium">✦ Kleo AI</span>
        </div>
        <button onClick={onClose} className="text-muted hover:text-white text-lg">×</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {messages.length === 0 && (
          <p className="text-muted text-sm text-center mt-8">
            Γεια σου! Τι μπορώ να σε βοηθήσω;
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'ml-4 text-white/90 bg-bg-elevated rounded-xl px-3 py-2'
                : 'mr-4 text-white/80 bg-teal/10 border border-teal/20 rounded-xl px-3 py-2'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && (
          <div className="mr-4 bg-teal/10 border border-teal/20 rounded-xl px-3 py-2">
            <span className="text-teal text-xs animate-pulse">Kleo γράφει...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ρώτα τον Kleo..."
            className="flex-1 bg-bg-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-teal"
          />
          <Button size="sm" onClick={sendMessage} disabled={loading}>
            →
          </Button>
        </div>
      </div>
    </div>
  )
}
