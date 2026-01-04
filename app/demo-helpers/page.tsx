import { getUser } from '@/lib/supabase/server'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function HelpersDemo() {
  // Demonstrates getUser() - returns null if not logged in (no redirect)
  const user = await getUser()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Supabase Helper Functions Demo
          </h1>

          <div className="space-y-6">
            {/* Current User Status */}
            <div className="border-l-4 border-indigo-500 pl-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Current Status
              </h2>
              {user ? (
                <div className="text-green-700 bg-green-50 p-4 rounded">
                  <p className="font-medium">✓ Logged In</p>
                  <p className="text-sm mt-1">Email: {user.email}</p>
                  <p className="text-sm">User ID: {user.id}</p>
                </div>
              ) : (
                <div className="text-orange-700 bg-orange-50 p-4 rounded">
                  <p className="font-medium">✗ Not Logged In</p>
                  <p className="text-sm mt-1">Please sign in to see user data</p>
                </div>
              )}
            </div>

            {/* getUser() Explanation */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1. <code className="text-indigo-600">getUser()</code>
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-3">
                  Returns the current user or <code>null</code>. Does NOT redirect.
                </p>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`import { getUser } from '@/lib/supabase/server'

export default async function MyPage() {
  const user = await getUser()
  
  if (user) {
    return <div>Welcome {user.email}</div>
  }
  
  return <div>Please log in</div>
}`}
                </pre>
                <p className="text-sm text-gray-600 mt-3">
                  <strong>Use case:</strong> When you want to conditionally render content based on auth status
                </p>
              </div>
            </div>

            {/* requireUser() Explanation */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2. <code className="text-indigo-600">requireUser()</code>
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-3">
                  Returns the user or redirects to <code>/auth/login</code> if not logged in.
                </p>
                <pre className="bg-gray-900 text-green-400 p-3 rounded text-sm overflow-x-auto">
{`import { requireUser } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  // Automatically redirects if not logged in
  const user = await requireUser()
  
  // This code only runs for logged-in users
  return <div>Welcome {user.email}</div>
}`}
                </pre>
                <p className="text-sm text-gray-600 mt-3">
                  <strong>Use case:</strong> For pages that require authentication (like <code>/app</code>)
                </p>
              </div>
            </div>

            {/* Comparison Table */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feature</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">getUser()</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">requireUser()</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Returns</td>
                      <td className="px-6 py-4 text-sm text-gray-600">User | null</td>
                      <td className="px-6 py-4 text-sm text-gray-600">User (always)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Redirects if not logged in</td>
                      <td className="px-6 py-4 text-sm text-gray-600">No</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Yes (to /auth/login)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Cached</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Yes (React cache)</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Yes (uses getUser)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Use in Server Components</td>
                      <td className="px-6 py-4 text-sm text-gray-600">✓</td>
                      <td className="px-6 py-4 text-sm text-gray-600">✓</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Use in Server Actions</td>
                      <td className="px-6 py-4 text-sm text-gray-600">✓</td>
                      <td className="px-6 py-4 text-sm text-gray-600">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Links */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
              {user ? (
                <>
                  <Link
                    href="/app"
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
                  >
                    Go to Protected App (uses requireUser)
                  </Link>
                  <Link
                    href="/"
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
                  >
                    Go to Home (uses getUser)
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/app"
                    className="px-6 py-3 border border-indigo-600 text-indigo-600 font-medium rounded-md hover:bg-indigo-50"
                  >
                    Try Protected Page →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

