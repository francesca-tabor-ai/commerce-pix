import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Check if user is logged in
  const user = await getUser()

  if (user) {
    // User is logged in, redirect to app
    redirect('/app')
  }

  // User is NOT logged in, show landing page
  return <LandingPage />
}
