'use server'

import { requireUser } from '@/lib/supabase/server'
import { initializeTrialSubscription } from '@/lib/db/trial'

/**
 * Initialize trial subscription for current user
 * Called after successful signup
 */
export async function initializeTrial(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser()
    
    const success = await initializeTrialSubscription(user.id)
    
    if (!success) {
      return {
        success: false,
        error: 'Failed to initialize trial subscription'
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error initializing trial:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

