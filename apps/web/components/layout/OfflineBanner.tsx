'use client'

import { useEffect, useState } from 'react'

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    setOffline(!navigator.onLine)
    const online = () => setOffline(false)
    const offline = () => setOffline(true)
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
    }
  }, [])

  if (!offline) return null

  return (
    <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center">
      <p className="text-yellow-400 text-xs">
        Εκτός σύνδεσης — Οι αλλαγές θα συγχρονιστούν όταν επιστρέψεις online.
      </p>
    </div>
  )
}
