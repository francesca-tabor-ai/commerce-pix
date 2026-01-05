import 'server-only'
import { createClient } from '@/lib/supabase/server'

export interface OnboardingProgress {
  user_id: string
  uploaded_photo: boolean
  generated_main_image: boolean
  generated_lifestyle_image: boolean
  downloaded_asset: boolean
  checklist_dismissed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface UpdateOnboardingProgress {
  uploaded_photo?: boolean
  generated_main_image?: boolean
  generated_lifestyle_image?: boolean
  downloaded_asset?: boolean
  checklist_dismissed?: boolean
}

/**
 * Get user's onboarding progress (creates default if doesn't exist)
 */
export async function getOnboardingProgress(userId: string): Promise<OnboardingProgress> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('onboarding_progress')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching onboarding progress:', error)
    throw error
  }

  // If no progress exists, create default
  if (!data) {
    const { data: newProgress, error: createError } = await supabase
      .from('onboarding_progress')
      .insert({
        user_id: userId,
        uploaded_photo: false,
        generated_main_image: false,
        generated_lifestyle_image: false,
        downloaded_asset: false,
        checklist_dismissed: false,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating default onboarding progress:', createError)
      throw createError
    }

    return newProgress
  }

  return data
}

/**
 * Update user's onboarding progress
 */
export async function updateOnboardingProgress(
  userId: string,
  updates: UpdateOnboardingProgress
): Promise<OnboardingProgress> {
  const supabase = await createClient()

  // Check if all tasks will be complete after this update
  const currentProgress = await getOnboardingProgress(userId)
  const updatedProgress = { ...currentProgress, ...updates }
  
  const allComplete =
    updatedProgress.uploaded_photo &&
    updatedProgress.generated_main_image &&
    updatedProgress.generated_lifestyle_image &&
    updatedProgress.downloaded_asset

  // If all complete and not already set, set completed_at
  const updateData: any = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  if (allComplete && !currentProgress.completed_at) {
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('onboarding_progress')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating onboarding progress:', error)
    throw error
  }

  return data
}

/**
 * Mark a specific onboarding task as complete
 */
export async function markTaskComplete(
  userId: string,
  task: 'uploaded_photo' | 'generated_main_image' | 'generated_lifestyle_image' | 'downloaded_asset'
): Promise<OnboardingProgress> {
  return updateOnboardingProgress(userId, { [task]: true })
}

/**
 * Dismiss the onboarding checklist
 */
export async function dismissOnboarding(userId: string): Promise<OnboardingProgress> {
  return updateOnboardingProgress(userId, { checklist_dismissed: true })
}

/**
 * Check if onboarding checklist should be shown
 */
export async function shouldShowOnboarding(userId: string): Promise<boolean> {
  const progress = await getOnboardingProgress(userId)
  
  // Don't show if dismissed
  if (progress.checklist_dismissed) {
    return false
  }
  
  // Don't show if all tasks complete
  if (progress.completed_at) {
    return false
  }
  
  return true
}

/**
 * Get onboarding completion percentage
 */
export async function getOnboardingCompletionPercentage(userId: string): Promise<number> {
  const progress = await getOnboardingProgress(userId)
  
  const completed = [
    progress.uploaded_photo,
    progress.generated_main_image,
    progress.generated_lifestyle_image,
    progress.downloaded_asset,
  ].filter(Boolean).length
  
  return Math.round((completed / 4) * 100)
}

/**
 * Helper functions for marking specific tasks complete
 */
export async function markPhotoUploaded(userId: string): Promise<void> {
  try {
    await markTaskComplete(userId, 'uploaded_photo')
  } catch (error) {
    console.error('Error marking photo uploaded:', error)
  }
}

export async function markMainImageGenerated(userId: string): Promise<void> {
  try {
    await markTaskComplete(userId, 'generated_main_image')
  } catch (error) {
    console.error('Error marking main image generated:', error)
  }
}

export async function markLifestyleImageGenerated(userId: string): Promise<void> {
  try {
    await markTaskComplete(userId, 'generated_lifestyle_image')
  } catch (error) {
    console.error('Error marking lifestyle image generated:', error)
  }
}

export async function markAssetDownloaded(userId: string): Promise<void> {
  try {
    await markTaskComplete(userId, 'downloaded_asset')
  } catch (error) {
    console.error('Error marking asset downloaded:', error)
  }
}
