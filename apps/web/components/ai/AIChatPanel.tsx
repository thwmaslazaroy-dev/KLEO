'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatPanelProps {
  open: boolean
  onClose: () => void
}

const WELCOME = 'Γεια σου! Είμαι ο Kleo. Ρώτα με ό,τι θέλεις — tasks, goals, πλάνο ημέρας, οτιδήποτε.'

export default function AIChatPanel({ open, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [offline, setOffline] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setOffline(!navigator.onLine)
    const on  = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || offline) return
    const userMsg = input.trim()
    setInput('')
    setMessages(p => [...p, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res  = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      setMessages(p => [...p, { role: 'assistant', content: data.data ?? 'Κάτι πήγε στραβά.' }])
    } catch {
      setMessages(p => [...p, { role: 'assistant', content: 'Δεν μπορώ να συνδεθώ τώρα.' }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, offline])

  if (!open) return null

  return (
    <div className="fixed right-0 top-0 bottom-0 w-80 bg-bg border-l border-white/5 flex flex-col z-40 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
          <span className="text-sm font-medium text-white">Kleo AI</span>
          {offline && <span className="text-xs text-coral bg-coral/10 px-2 py-0.5 rounded-full">εκτός σύνδεσης</span>}
        </div>
        <button onClick={onClose} className="text-muted hover:text-white transition w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 text-lg">×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {/* Welcome */}
        <div className="mr-4 bg-teal/10 border border-teal/20 rounded-xl px-3 py-2.5">
          <p className="text-xs text-teal font-medium mb-1">✦ Kleo</p>
          <p className="text-sm text-white/80 leading-relaxed">{WELCOME}</p>
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`text-sm leading-relaxed ${
            msg.role === 'user'
              ? 'ml-6 bg-bg-elevated rounded-xl px-3 py-2.5 text-white/90'
              : 'mr-4 bg-teal/10 border border-teal/15 rounded-xl px-3 py-2.5'
          }`}>
            {msg.role === 'assistant' && (
              <p className="text-xs text-teal font-medium mb-1">✦ Kleo</p>
            )}
            <p className="text-white/85 whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {loading && (
          <div className="mr-4 bg-teal/10 border border-teal/15 rounded-xl px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5 flex-shrink-0">
        {offline ? (
          <p className="text-xs text-muted text-center py-2">📵 Χρειάζεται σύνδεση για AI chat</p>
        ) : (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ρώτα τον Kleo..."
              className="flex-1 bg-bg-elevated border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-teal transition"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 flex items-center justify-center bg-teal/20 hover:bg-teal/30 text-teal rounded-xl transition disabled:opacity-40"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
