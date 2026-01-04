import { requireUser } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import AppClient from '@/components/AppClient'

// Force dynamic rendering to avoid build-time errors with missing env vars
export const dynamic = 'force-dynamic'

export default async function AppPage() {
  // requireUser() will redirect to /auth/login if not logged in
  const user = await requireUser()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with logout button */}
      <header className="bg-white border-b shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Commerce PIX</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.email}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main app content */}
      <div className="flex-1 overflow-hidden">
        <AppClient userId={user.id} />
      </div>
    </div>
  )
}
