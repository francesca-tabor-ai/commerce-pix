// Client-side billing functions
import { createClient } from '@/lib/supabase/client'
import type { Plan, Subscription, CreditLedgerEntry, UsageCounter } from './billing-types'

// =====================================================
// PLANS (Client)
// =====================================================

/**
 * Get all available plans (client-side)
 */
export async function getPlans(): Promise<Plan[]> {
  const supabase = createClient()
  
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
 * Get a single plan by ID (client-side)
 */
export async function getPlan(planId: string): Promise<Plan | null> {
  const supabase = createClient()
  
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
// SUBSCRIPTIONS (Client)
// =====================================================

/**
 * Get current user's subscription (client-side)
 */
export async function getCurrentUserSubscription(): Promise<Subscription | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No subscription found
      return null
    }
    console.error('Error fetching subscription:', error)
    return null
  }
  
  return data
}

/**
 * Get subscription with plan details (client-side)
 */
export async function getSubscriptionWithPlan(): Promise<(Subscription & { plan: Plan }) | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      plan:plan_id (*)
    `)
    .eq('user_id', user.id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching subscription with plan:', error)
    return null
  }
  
  return data as any
}

// =====================================================
// CREDIT LEDGER (Client)
// =====================================================

/**
 * Get current user's credit balance (client-side)
 */
export async function getCurrentUserCreditBalance(): Promise<number> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return 0
  }
  
  const { data, error } = await supabase
    .rpc('get_user_credit_balance', { p_user_id: user.id })
  
  if (error) {
    console.error('Error fetching credit balance:', error)
    return 0
  }
  
  return data || 0
}

/**
 * Get current user's credit history (client-side)
 */
export async function getCurrentUserCreditHistory(limit: number = 50): Promise<CreditLedgerEntry[]> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return []
  }
  
  const { data, error } = await supabase
    .from('credit_ledger')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching credit history:', error)
    return []
  }
  
  return data || []
}

// =====================================================
// USAGE COUNTERS (Client)
// =====================================================

/**
 * Get current user's daily usage (client-side)
 */
export async function getCurrentUserDailyUsage(
  day: string = new Date().toISOString().split('T')[0]
): Promise<UsageCounter | null> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }
  
  const { data, error } = await supabase
    .from('usage_counters')
    .select('*')
    .eq('user_id', user.id)
    .eq('day', day)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching usage:', error)
    return null
  }
  
  return data
}

/**
 * Get current user's usage for current billing period (client-side)
 */
export async function getCurrentUserPeriodUsage(): Promise<number> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return 0
  }
  
  // Get subscription to determine period
  const subscription = await getCurrentUserSubscription()
  
  if (!subscription || !subscription.current_period_start) {
    return 0
  }
  
  const { data, error } = await supabase
    .from('usage_counters')
    .select('generations')
    .eq('user_id', user.id)
    .gte('day', subscription.current_period_start)
  
  if (error) {
    console.error('Error fetching period usage:', error)
    return 0
  }
  
  return data?.reduce((sum, record) => sum + record.generations, 0) || 0
}

/**
 * Check if current user has enough credits (client-side)
 */
export async function hasEnoughCredits(): Promise<boolean> {
  const balance = await getCurrentUserCreditBalance()
  return balance > 0
}

/**
 * Get remaining credits with details (client-side)
 */
export async function getRemainingCreditsInfo(): Promise<{
  balance: number
  used_this_period: number
  monthly_allowance: number | null
  plan_name: string | null
}> {
  const balance = await getCurrentUserCreditBalance()
  const usage = await getCurrentUserPeriodUsage()
  const subscription = await getSubscriptionWithPlan()
  
  return {
    balance,
    used_this_period: usage,
    monthly_allowance: subscription?.plan?.monthly_credits || null,
    plan_name: subscription?.plan?.name || null,
  }
}

