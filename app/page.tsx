import { getUser } from '@/lib/supabase/server'
import Link from 'next/link'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Use getUser() - doesn't redirect, just checks if user is logged in
  const user = await getUser()

  if (user) {
    // User is logged in, show welcome message and link to app
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome Back!
          </h1>
          <p className="text-gray-600 mb-6">
            You're logged in as <span className="font-medium text-indigo-600">{user.email}</span>
          </p>
          <Link
            href="/app"
            className="inline-block w-full py-3 px-6 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Go to App
          </Link>
        </div>
      </div>
    )
  }

  // User is NOT logged in, show landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commerce PIX
          </h1>
          <p className="text-gray-600">
            Next.js + Supabase + Tailwind v4
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="block w-full py-3 px-6 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors text-center"
          >
            Sign In
          </Link>
          
          <Link
            href="/auth/signup"
            className="block w-full py-3 px-6 border border-indigo-600 text-indigo-600 font-medium rounded-md hover:bg-indigo-50 transition-colors text-center"
          >
            Create Account
          </Link>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Features:</h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>✓ Supabase Authentication</li>
            <li>✓ Protected Routes</li>
            <li>✓ Password Reset</li>
            <li>✓ Tailwind CSS v4</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
