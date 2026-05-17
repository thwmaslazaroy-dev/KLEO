'use client'

import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const stored = (localStorage.getItem('kleo_theme') ?? 'dark') as 'dark' | 'light'
    setTheme(stored)
    applyTheme(stored)
  }, [])

  function applyTheme(t: 'dark' | 'light') {
    const html = document.documentElement
    if (t === 'light') {
      html.classList.add('light')
      html.classList.remove('dark')
    } else {
      html.classList.add('dark')
      html.classList.remove('light')
    }
  }

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
    localStorage.setItem('kleo_theme', next)
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 text-sm text-muted hover:text-white transition"
      title={theme === 'dark' ? 'Εναλλαγή σε Light mode' : 'Εναλλαγή σε Dark mode'}
    >
      <span className="text-base">{theme === 'dark' ? '☀️' : '🌙'}</span>
      <span className="hidden sm:inline text-xs">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  )
}
