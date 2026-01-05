import 'server-only'
import { requireUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Check if user is an admin based on ADMIN_EMAILS env var
 * 
 * ADMIN_EMAILS should be a comma-separated list of email addresses
 * Example: admin@example.com,user@company.com
 */
export async function requireAdmin() {
  const user = await requireUser()

  const adminEmails = process.env.ADMIN_EMAILS || ''
  const allowedEmails = adminEmails
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

  const userEmail = user.email?.toLowerCase() || ''

  if (!allowedEmails.includes(userEmail)) {
    console.warn(`Unauthorized admin access attempt by: ${userEmail}`)
    redirect('/app')
  }

  return user
}

/**
 * Check if user is an admin without redirecting
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await requireUser()

    const adminEmails = process.env.ADMIN_EMAILS || ''
    const allowedEmails = adminEmails
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)

    const userEmail = user.email?.toLowerCase() || ''

    return allowedEmails.includes(userEmail)
  } catch (error) {
    return false
  }
}

