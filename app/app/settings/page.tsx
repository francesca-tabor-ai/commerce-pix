import { requireUser } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'
import { getUserPreferences } from '@/lib/db/preferences'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await requireUser()
  const preferences = await getUserPreferences(user.id)

  return (
    <SettingsClient 
      user={user} 
      initialPreferences={preferences}
    />
  )
}
