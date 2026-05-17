import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import QuickCapture from '@/components/layout/QuickCapture'
import OfflineBanner from '@/components/layout/OfflineBanner'
import ChatButton from '@/components/ai/ChatButton'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar profile={profile} />

      <div className="flex-1 flex flex-col min-w-0">
        <OfflineBanner />
        <main className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide">
          {children}
        </main>
      </div>

      <QuickCapture userId={user.id} />
      <ChatButton />
    </div>
  )
}
