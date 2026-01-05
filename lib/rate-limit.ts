import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { getUserSubscription } from '@/lib/db/billing'

/**
 * Rate Limiting & Abuse Protection
 * 
 * Enforces generation limits to prevent abuse and encourage upgrades:
 * - All users: 5 generations per minute
 * - Trial users: 100 generations per day
 * - Paid users: Unlimited daily generations (only per-minute limit)
 */

// Rate limit settings
export const RATE_LIMITS = {
  // All users (prevents API abuse)
  GENERATIONS_PER_MINUTE: 5,
  
  // Trial/free users only
  TRIAL_GENERATIONS_PER_DAY: 100,
  
  // Paid users (no daily limit, only per-minute for abuse prevention)
  PAID_GENERATIONS_PER_DAY: Number.MAX_SAFE_INTEGER, // Effectively unlimited
} as const

export type CounterType = 'per_minute' | 'per_day'

export interface UsageCounter {
  id: string
  user_id: string
  counter_type: CounterType
  count: number
  period_start: string
  created_at: string
  updated_at: string
}

export interface RateLimitResult {
  allowed: boolean
  limit: number
  current: number
  remaining: number
  resetAt: Date
  message?: string
  upgradeRequired?: boolean  // Indicates user should upgrade (for UI handling)
  isTrialUser?: boolean     // Indicates if limit is due to trial status
}

/**
 * Get or create usage counter for user
 */
async function getOrCreateCounter(
  userId: string,
  counterType: CounterType
): Promise<UsageCounter | null> {
  const supabase = await createClient()

  // Calculate period start based on counter type
  const now = new Date()
  let periodStart: Date

  if (counterType === 'per_minute') {
    // Round down to current minute
    periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0, 0)
  } else {
    // Round down to start of day (UTC)
    periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
  }

  // Try to get existing counter for this period
  const { data: existing, error: fetchError } = await supabase
    .from('usage_counters')
    .select('*')
    .eq('user_id', userId)
    .eq('counter_type', counterType)
    .eq('period_start', periodStart.toISOString())
    .single()

  if (existing && !fetchError) {
    return existing
  }

  // Create new counter if doesn't exist
  const { data: newCounter, error: createError } = await supabase
    .from('usage_counters')
    .insert({
      user_id: userId,
      counter_type: counterType,
      count: 0,
      period_start: periodStart.toISOString(),
    })
    .select()
    .single()

  if (createError) {
    console.error('Error creating usage counter:', createError)
    return null
  }

  return newCounter
}

/**
 * Increment usage counter
 */
async function incrementCounter(
  userId: string,
  counterType: CounterType
): Promise<UsageCounter | null> {
  const supabase = await createClient()

  // Get or create counter
  const counter = await getOrCreateCounter(userId, counterType)

  if (!counter) {
    return null
  }

  // Increment count
  const { data, error } = await supabase
    .from('usage_counters')
    .update({ count: counter.count + 1 })
    .eq('id', counter.id)
    .select()
    .single()

  if (error) {
    console.error('Error incrementing counter:', error)
    return null
  }

  return data
}

/**
 * Calculate reset time for counter
 */
function getResetTime(counterType: CounterType, periodStart: string): Date {
  const start = new Date(periodStart)

  if (counterType === 'per_minute') {
    // Reset at start of next minute
    return new Date(start.getTime() + 60 * 1000)
  } else {
    // Reset at start of next day (UTC)
    return new Date(Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate() + 1,
      0, 0, 0, 0
    ))
  }
}

/**
 * Check if user is within rate limit for specific counter type
 */
async function checkRateLimit(
  userId: string,
  counterType: CounterType
): Promise<RateLimitResult> {
  // Determine limit based on counter type and user subscription
  let limit: number
  let isTrialUser = false
  
  if (counterType === 'per_minute') {
    // All users have same per-minute limit (abuse prevention)
    limit = RATE_LIMITS.GENERATIONS_PER_MINUTE
  } else {
    // Per-day limit depends on subscription status
    const subscription = await getUserSubscription(userId)
    
    // Check if user is on trial or has no active subscription
    isTrialUser = !subscription || 
                  subscription.status === 'trialing' || 
                  subscription.status === 'canceled' ||
                  subscription.status === 'past_due'
    
    if (isTrialUser) {
      limit = RATE_LIMITS.TRIAL_GENERATIONS_PER_DAY
    } else {
      // Active paid subscription - no daily limit
      limit = RATE_LIMITS.PAID_GENERATIONS_PER_DAY
    }
  }

  // Get or create counter
  const counter = await getOrCreateCounter(userId, counterType)

  if (!counter) {
    // If we can't get counter, allow but log error
    console.error('Failed to get usage counter, allowing request')
    return {
      allowed: true,
      limit,
      current: 0,
      remaining: limit,
      resetAt: new Date(Date.now() + 60 * 1000),
      isTrialUser,
    }
  }

  const current = counter.count
  const remaining = Math.max(0, limit - current)
  const resetAt = getResetTime(counterType, counter.period_start)
  const allowed = current < limit

  const result: RateLimitResult = {
    allowed,
    limit,
    current,
    remaining,
    resetAt,
    isTrialUser,
  }

  if (!allowed) {
    const resetIn = Math.ceil((resetAt.getTime() - Date.now()) / 1000)
    
    if (counterType === 'per_minute') {
      // Per-minute limit message (abuse prevention)
      result.message = `Slow down! You've reached the maximum of ${limit} generations per minute. Please wait ${resetIn} seconds before trying again.`
      result.upgradeRequired = false
    } else {
      // Per-day limit message
      if (isTrialUser) {
        // Trial user hit daily limit - encourage upgrade
        const hoursUntilReset = Math.ceil(resetIn / 3600)
        result.message = `You've reached your daily limit of ${limit} generations. Upgrade to a paid plan for unlimited daily generations!`
        result.upgradeRequired = true
      } else {
        // Paid user somehow hit the "unlimited" limit (should never happen)
        result.message = `Daily generation limit reached. This limit resets in ${Math.ceil(resetIn / 3600)} hours.`
        result.upgradeRequired = false
      }
    }
  }

  return result
}

/**
 * Check all rate limits for user
 */
export async function checkAllRateLimits(userId: string): Promise<{
  allowed: boolean
  perMinute: RateLimitResult
  perDay: RateLimitResult
  blockedBy?: 'per_minute' | 'per_day'
}> {
  const [perMinuteResult, perDayResult] = await Promise.all([
    checkRateLimit(userId, 'per_minute'),
    checkRateLimit(userId, 'per_day'),
  ])

  let allowed = true
  let blockedBy: 'per_minute' | 'per_day' | undefined

  if (!perMinuteResult.allowed) {
    allowed = false
    blockedBy = 'per_minute'
  } else if (!perDayResult.allowed) {
    allowed = false
    blockedBy = 'per_day'
  }

  return {
    allowed,
    perMinute: perMinuteResult,
    perDay: perDayResult,
    blockedBy,
  }
}

/**
 * Record generation usage (increment both counters)
 */
export async function recordGenerationUsage(userId: string): Promise<boolean> {
  try {
    await Promise.all([
      incrementCounter(userId, 'per_minute'),
      incrementCounter(userId, 'per_day'),
    ])
    return true
  } catch (error) {
    console.error('Error recording generation usage:', error)
    return false
  }
}

/**
 * Get usage stats for user
 */
export async function getUserUsageStats(userId: string): Promise<{
  perMinute: { current: number; limit: number; remaining: number }
  perDay: { current: number; limit: number; remaining: number; isTrialUser: boolean }
}> {
  const perMinuteCounter = await getOrCreateCounter(userId, 'per_minute')
  const perDayCounter = await getOrCreateCounter(userId, 'per_day')
  
  // Check subscription status for daily limit
  const subscription = await getUserSubscription(userId)
  const isTrialUser = !subscription || 
                      subscription.status === 'trialing' || 
                      subscription.status === 'canceled' ||
                      subscription.status === 'past_due'
  
  const dailyLimit = isTrialUser 
    ? RATE_LIMITS.TRIAL_GENERATIONS_PER_DAY 
    : RATE_LIMITS.PAID_GENERATIONS_PER_DAY

  return {
    perMinute: {
      current: perMinuteCounter?.count || 0,
      limit: RATE_LIMITS.GENERATIONS_PER_MINUTE,
      remaining: Math.max(0, RATE_LIMITS.GENERATIONS_PER_MINUTE - (perMinuteCounter?.count || 0)),
    },
    perDay: {
      current: perDayCounter?.count || 0,
      limit: dailyLimit,
      remaining: Math.max(0, dailyLimit - (perDayCounter?.count || 0)),
      isTrialUser,
    },
  }
}

/**
 * Clean up old counters (should be run periodically)
 */
export async function cleanupOldCounters(): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .rpc('cleanup_old_usage_counters')

  if (error) {
    console.error('Error cleaning up old counters:', error)
    return 0
  }

  return data || 0
}

