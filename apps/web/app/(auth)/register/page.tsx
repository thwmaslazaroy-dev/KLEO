'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error

      if (data.session) {
        await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user!.id)
        router.push('/')
        router.refresh()
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Κάτι πήγε στραβά')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-heading font-bold mb-2">Έλεγξε το email σου</h2>
          <p className="text-muted text-sm">Στάλθηκε σύνδεσμος επιβεβαίωσης στο {email}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-elevated flex items-center justify-center">
            <span className="text-2xl font-heading font-bold text-white">K</span>
          </div>
          <h1 className="text-2xl font-heading font-bold">Δημιουργία λογαριασμού</h1>
          <p className="text-muted text-sm mt-1">Ξεκίνα να θυμάσαι τα πάντα</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1">Όνομα</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-bg-elevated border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-teal transition"
              placeholder="Tommy"
            />
          </div>

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
              minLength={6}
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
            {loading ? 'Δημιουργία...' : 'Δημιουργία λογαριασμού'}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Έχεις ήδη λογαριασμό;{' '}
          <Link href="/login" className="text-teal hover:underline">
            Σύνδεση
          </Link>
        </p>
      </div>
    </main>
  )
}
