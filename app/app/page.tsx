import { requireUser } from '@/lib/supabase/server'
import SignOutButton from '@/components/SignOutButton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Force dynamic rendering to avoid build-time errors with missing env vars
export const dynamic = 'force-dynamic'

export default async function AppPage() {
  // requireUser() will redirect to /auth/login if not logged in
  const user = await requireUser()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logout button */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, {user.email}
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle>Protected Dashboard</CardTitle>
              <CardDescription>
                This page can only be seen by logged-in users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    🎉 You're logged in!
                  </h3>
                  <p className="text-sm text-blue-800">
                    This is a protected area that requires authentication. 
                    Your session is managed securely via cookies.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">User Information</h3>
                    <dl className="space-y-1 text-sm">
                      <div>
                        <dt className="text-muted-foreground inline">Email:</dt>
                        <dd className="inline ml-2 font-medium">{user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground inline">User ID:</dt>
                        <dd className="inline ml-2 font-mono text-xs">{user.id}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Quick Actions</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the <strong>Sign out</strong> button in the header to log out of your account.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
