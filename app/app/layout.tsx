import { requireUser } from '@/lib/supabase/server'
import AppSidebar from '@/components/app/AppSidebar'
import AppHeader from '@/components/app/AppHeader'

export const dynamic = 'force-dynamic'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader user={user} />
        <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  )
}

