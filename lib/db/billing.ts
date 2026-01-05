import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { 
  Plan, 
  Subscription, 
  CreditLedgerEntry, 
  UsageCounter,
  NewSubscription,
  CreditReason,
  CreditRefType,
  CreditBalance
} from './billing-types'

// =====================================================
// PLANS
// =====================================================

/**
 * Get all available plans
 */
export async function getPlans(): Promise<Plan[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('monthly_price_cents', { ascending: true })
  
  if (error) {
    console.error('Error fetching plans:', error)
    throw error
  }
  
  return data || []
}

/**
 * Get a single plan by ID
 */
export async function getPlan(planId: string): Promise<Plan | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', planId)
    .single()
  
  if (error) {
    console.error('Error fetching plan:', error)
    return null
  }
  
  return data
}

// =====================================================
// SUBSCRIPTIONS
// =====================================================

/**
 * Get user's subscription
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No subscription found
      return null
    }
    console.error('Error fetching subscription:', error)
    throw error
  }
  
  return data
}

/**
 * Create a new subscription for a user
 */
export async function createSubscription(subscription: NewSubscription): Promise<Subscription | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .insert(subscription)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating subscription:', error)
    throw error
  }
  
  return data
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  userId: string,
  updates: Partial<Subscription>
): Promise<Subscription | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
  
  return data
}

// =====================================================
// CREDIT LEDGER
// =====================================================

/**
 * Get user's credit balance
 */
export async function getUserCreditBalance(userId: string): Promise<number> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('get_user_credit_balance', { p_user_id: userId })
  
  if (error) {
    console.error('Error fetching credit balance:', error)
    return 0
  }
  
  return data || 0
}

/**
 * Get user's credit history
 */
export async function getUserCreditHistory(
  userId: string,
  limit: number = 50
): Promise<CreditLedgerEntry[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('credit_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching credit history:', error)
    throw error
  }
  
  return data || []
}

/**
 * Add credits to user's account (server action)
 * Note: This should typically be called from a server action or API route
 */
export async function addCredits(
  userId: string,
  delta: number,
  reason: CreditReason,
  refType: CreditRefType = null,
  refId: string | null = null
): Promise<string | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('add_credits', {
      p_user_id: userId,
      p_delta: delta,
      p_reason: reason,
      p_ref_type: refType,
      p_ref_id: refId
    })
  
  if (error) {
    console.error('Error adding credits:', error)
    throw error
  }
  
  return data
}

/**
 * Deduct credits for a generation
 */
export async function deductCreditsForGeneration(
  userId: string,
  jobId: string
): Promise<void> {
  await addCredits(userId, -1, 'generation', 'job', jobId)
}

/**
 * Get comprehensive credit balance with subscription info
 */
export async function getUserCreditBalanceWithDetails(userId: string): Promise<CreditBalance> {
  const supabase = await createClient()
  
  // Get credit balance
  const balance = await getUserCreditBalance(userId)
  
  // Get subscription
  const subscription = await getUserSubscription(userId)
  
  if (!subscription) {
    return { balance }
  }
  
  // Get plan details
  const plan = await getPlan(subscription.plan_id)
  
  if (!plan) {
    return { balance }
  }
  
  return {
    balance,
    subscription: {
      plan,
      monthly_credits: plan.monthly_credits,
      period_start: subscription.current_period_start || '',
      period_end: subscription.current_period_end || '',
    }
  }
}

// =====================================================
// USAGE COUNTERS
// =====================================================

/**
 * Get user's usage for a specific day
 */
export async function getUserDailyUsage(
  userId: string,
  day: string = new Date().toISOString().split('T')[0]
): Promise<UsageCounter | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('usage_counters')
    .select('*')
    .eq('user_id', userId)
    .eq('day', day)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No usage found
      return null
    }
    console.error('Error fetching usage:', error)
    throw error
  }
  
  return data
}

/**
 * Get user's usage for current billing period
 */
export async function getUserPeriodUsage(userId: string): Promise<number> {
  const supabase = await createClient()
  
  // Get subscription to determine period
  const subscription = await getUserSubscription(userId)
  
  if (!subscription || !subscription.current_period_start) {
    return 0
  }
  
  const { data, error } = await supabase
    .from('usage_counters')
    .select('generations')
    .eq('user_id', userId)
    .gte('day', subscription.current_period_start)
  
  if (error) {
    console.error('Error fetching period usage:', error)
    return 0
  }
  
  return data?.reduce((sum, record) => sum + record.generations, 0) || 0
}

/**
 * Increment usage counter
 */
export async function incrementUsageCounter(userId: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .rpc('increment_usage_counter', {
      p_user_id: userId,
      p_day: new Date().toISOString().split('T')[0]
    })
  
  if (error) {
    console.error('Error incrementing usage:', error)
    throw error
  }
}

/**
 * Check if user has enough credits for a generation
 */
export async function hasEnoughCredits(userId: string): Promise<boolean> {
  const balance = await getUserCreditBalance(userId)
  return balance > 0
}

/**
 * Get user's remaining credits for current period
 */
export async function getRemainingCredits(userId: string): Promise<number> {
  const balance = await getUserCreditBalance(userId)
  return Math.max(0, balance)
}

