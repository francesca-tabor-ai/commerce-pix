import { requireUser } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'

// Force dynamic rendering to avoid build-time errors with missing env vars
export const dynamic = 'force-dynamic'

export default async function AppPage() {
  // requireUser() will redirect to /auth/login if not logged in
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Protected App</h1>
            <SignOutButton />
          </div>
          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-700 text-lg">
              This page can only be seen by logged-in users.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Logged in as: {user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

