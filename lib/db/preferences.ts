import 'server-only'
import { createClient } from '@/lib/supabase/server'

export type BrandTone = 'professional' | 'luxury' | 'playful' | 'minimal' | 'bold'

export interface UserPreferences {
  user_id: string
  default_brand_tone: BrandTone | null
  email_notifications: boolean
  created_at: string
  updated_at: string
}

export interface UpdatePreferences {
  default_brand_tone?: BrandTone | null
  email_notifications?: boolean
}

/**
 * Get user preferences (creates default if doesn't exist)
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user preferences:', error)
    throw error
  }

  // If no preferences exist, create default
  if (!data) {
    const { data: newPrefs, error: createError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        default_brand_tone: null,
        email_notifications: true,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating default preferences:', createError)
      throw createError
    }

    return newPrefs
  }

  return data
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  userId: string,
  updates: UpdatePreferences
): Promise<UserPreferences> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('user_preferences')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user preferences:', error)
    throw error
  }

  return data
}

/**
 * Delete user preferences (for account deletion)
 */
export async function deleteUserPreferences(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_preferences')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting user preferences:', error)
    return false
  }

  return true
}

