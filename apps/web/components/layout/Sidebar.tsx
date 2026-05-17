'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { clsx } from 'clsx'
import type { Profile } from '@kleo/shared'

const NAV = [
  { href: '/',          label: 'Σήμερα',       icon: '☀️' },
  { href: '/tasks',     label: 'Tasks',        icon: '✅' },
  { href: '/calendar',  label: 'Ημερολόγιο',   icon: '📅' },
  { href: '/notes',     label: 'Σημειώσεις',   icon: '📝' },
  { href: '/thoughts',  label: 'Σκέψεις',      icon: '💭' },
  { href: '/journal',   label: 'Ημερολόγιο',   icon: '📔' },
  { href: '/goals',     label: 'Στόχοι',       icon: '🎯' },
  { href: '/contacts',  label: 'Επαφές',       icon: '👥' },
  { href: '/alarms',    label: 'Ξυπνητήρια',   icon: '⏰' },
  { href: '/stats',     label: 'Στατιστικά',   icon: '📊' },
  { href: '/archive',   label: 'Αρχείο',       icon: '🗂️' },
]

interface SidebarProps {
  profile: Profile | null
}

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-bg border-r border-white/5 py-6 px-3">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="w-8 h-8 rounded-xl bg-bg-elevated flex items-center justify-center">
          <span className="text-sm font-heading font-bold text-white">K</span>
        </div>
        <span className="font-heading font-semibold text-white">Kleo</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition',
              pathname === item.href
                ? 'bg-bg-elevated text-white font-medium'
                : 'text-muted hover:text-white hover:bg-white/5'
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/5 pt-4 px-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-coral/20 flex items-center justify-center text-xs font-medium text-coral">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'T'}
          </div>
          <span className="text-sm text-muted truncate">{profile?.full_name ?? 'Tommy'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-muted hover:text-white transition"
        >
          Αποσύνδεση
        </button>
      </div>
    </aside>
  )
}
