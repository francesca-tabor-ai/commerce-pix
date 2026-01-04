import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export async function createClient() {
  const cookieStore = await cookies()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.')
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Get the current user from the session
 * Returns the user object if logged in, null otherwise
 * Uses React cache to avoid multiple fetches in the same request
 */
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error fetching user:', error.message)
    return null
  }
  
  return user
})

/**
 * Require a user to be logged in
 * If not logged in, redirects to /auth/login
 * Returns the user object
 */
export async function requireUser() {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  return user
}

