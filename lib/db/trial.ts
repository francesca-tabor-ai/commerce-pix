import { createClient } from '@/lib/supabase/server'
import { createSubscription, grantBonusCredits } from './billing'

/**
 * Initialize trial subscription for a new user
 * - Creates a trialing subscription on starter plan
 * - Grants 20 free trial credits
 */
export async function initializeTrialSubscription(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingSubscription) {
      console.log('User already has a subscription')
      return false
    }

    // Create trial subscription on starter plan
    const now = new Date()
    const trialEnd = new Date(now)
    trialEnd.setDate(trialEnd.getDate() + 14) // 14-day trial

    await createSubscription({
      user_id: userId,
      plan_id: 'starter',
      status: 'trialing',
      current_period_start: now.toISOString(),
      current_period_end: trialEnd.toISOString(),
      cancel_at_period_end: false,
    })

    // Grant 20 trial credits
    await grantBonusCredits(userId, 20, 'Free trial credits')

    console.log(`Trial subscription created for user ${userId}`)
    return true
  } catch (error) {
    console.error('Error initializing trial subscription:', error)
    return false
  }
}

/**
 * Check if a user is on trial
 */
export async function isUserOnTrial(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .single()

  return subscription?.status === 'trialing'
}

/**
 * Get trial days remaining
 */
export async function getTrialDaysRemaining(userId: string): Promise<number | null> {
  const supabase = await createClient()
  
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .single()

  if (!subscription || subscription.status !== 'trialing') {
    return null
  }

  const now = new Date()
  const endDate = new Date(subscription.current_period_end)
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

