'use server'

import { requireUser } from '@/lib/supabase/server'
import {
  getOnboardingProgress,
  markTaskComplete,
  dismissOnboarding,
  shouldShowOnboarding,
  getOnboardingCompletionPercentage,
} from '@/lib/db/onboarding'
import { revalidatePath } from 'next/cache'

export async function getOnboardingProgressAction() {
  const user = await requireUser()

  try {
    const progress = await getOnboardingProgress(user.id)
    const shouldShow = await shouldShowOnboarding(user.id)
    const percentage = await getOnboardingCompletionPercentage(user.id)

    return {
      success: true,
      progress,
      shouldShow,
      percentage,
    }
  } catch (error) {
    console.error('Error fetching onboarding progress:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch onboarding progress',
    }
  }
}

export async function markOnboardingTaskComplete(
  task: 'uploaded_photo' | 'generated_main_image' | 'generated_lifestyle_image' | 'downloaded_asset'
) {
  const user = await requireUser()

  try {
    const progress = await markTaskComplete(user.id, task)
    
    revalidatePath('/app')
    revalidatePath('/app/projects')

    return {
      success: true,
      progress,
    }
  } catch (error) {
    console.error('Error marking task complete:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark task complete',
    }
  }
}

export async function dismissOnboardingAction() {
  const user = await requireUser()

  try {
    await dismissOnboarding(user.id)
    
    revalidatePath('/app')
    revalidatePath('/app/projects')

    return {
      success: true,
      message: 'Onboarding dismissed successfully',
    }
  } catch (error) {
    console.error('Error dismissing onboarding:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to dismiss onboarding',
    }
  }
}

export async function markAssetDownloadedAction() {
  const user = await requireUser()

  try {
    await markTaskComplete(user.id, 'downloaded_asset')
    
    revalidatePath('/app')

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error marking asset downloaded:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark asset downloaded',
    }
  }
}
