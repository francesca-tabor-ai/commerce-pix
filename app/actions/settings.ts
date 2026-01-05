'use server'

import { requireUser } from '@/lib/supabase/server'
import { updateUserPreferences, type BrandTone } from '@/lib/db/preferences'
import { revalidatePath } from 'next/cache'

export async function updateDefaultBrandTone(brandTone: BrandTone | null) {
  const user = await requireUser()

  try {
    await updateUserPreferences(user.id, {
      default_brand_tone: brandTone,
    })

    revalidatePath('/app/settings')

    return { success: true, message: 'Default brand tone updated successfully' }
  } catch (error) {
    console.error('Error updating brand tone:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update brand tone',
    }
  }
}

export async function updateEmailNotifications(enabled: boolean) {
  const user = await requireUser()

  try {
    await updateUserPreferences(user.id, {
      email_notifications: enabled,
    })

    revalidatePath('/app/settings')

    return { success: true, message: 'Email notification preferences updated' }
  } catch (error) {
    console.error('Error updating email notifications:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update email notifications',
    }
  }
}

export async function requestAccountDeletion() {
  const user = await requireUser()

  // MVP: Just log the request
  console.log(`Account deletion requested for user: ${user.id}`)

  // In production, this would:
  // 1. Send confirmation email
  // 2. Create deletion request in database
  // 3. Schedule deletion after grace period
  // 4. Delete all user data (projects, assets, generations, etc.)

  return {
    success: true,
    message: 'Account deletion request received. Our team will contact you shortly.',
  }
}

