'use server'

import { requireUser } from '@/lib/supabase/server'
import { updateSubscription, getUserSubscription } from '@/lib/db/billing'
import { revalidatePath } from 'next/cache'

/**
 * Toggle subscription cancellation
 * Sets cancel_at_period_end flag
 */
export async function toggleCancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser()

    // Verify subscription belongs to user
    const subscription = await getUserSubscription(user.id)

    if (!subscription || subscription.id !== subscriptionId) {
      return {
        success: false,
        error: 'Subscription not found or access denied'
      }
    }

    // Update subscription
    const updated = await updateSubscription(user.id, {
      cancel_at_period_end: cancelAtPeriodEnd
    })

    if (!updated) {
      return {
        success: false,
        error: 'Failed to update subscription'
      }
    }

    // Revalidate billing page
    revalidatePath('/app/billing')

    return { success: true }
  } catch (error) {
    console.error('Error toggling subscription cancellation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Change subscription plan
 * TODO: Integrate with Stripe for actual plan changes
 */
export async function changeSubscriptionPlan(
  newPlanId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser()

    // Get current subscription
    const subscription = await getUserSubscription(user.id)

    if (!subscription) {
      return {
        success: false,
        error: 'No active subscription found'
      }
    }

    // TODO: Implement Stripe subscription update
    // For now, just update the local record
    const updated = await updateSubscription(user.id, {
      plan_id: newPlanId
    })

    if (!updated) {
      return {
        success: false,
        error: 'Failed to update subscription'
      }
    }

    // Revalidate billing page
    revalidatePath('/app/billing')

    return { success: true }
  } catch (error) {
    console.error('Error changing subscription plan:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

