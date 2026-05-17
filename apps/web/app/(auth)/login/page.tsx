'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-elevated flex items-center justify-center">
            <span className="text-2xl font-heading font-bold">
              <span className="text-white">K</span>
            </span>
          </div>
          <h1 className="text-2xl font-heading font-bold">Καλώς ήρθες στο Kleo</h1>
          <p className="text-muted text-sm mt-1">Θυμάμαι εγώ, εσύ απλά ζεις.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-teal transition"
              placeholder="tommy@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-muted mb-1">Κωδικός</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-teal transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-coral text-sm bg-coral/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coral hover:bg-coral-light disabled:opacity-50 text-white font-medium rounded-xl py-3 transition"
          >
            {loading ? 'Σύνδεση...' : 'Σύνδεση'}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Δεν έχεις λογαριασμό;{' '}
          <Link href="/register" className="text-teal hover:underline">
            Εγγραφή
          </Link>
        </p>
      </div>
    </main>
  )
}
