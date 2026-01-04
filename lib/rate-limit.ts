import 'server-only'
import { createClient } from '@/lib/supabase/server'

/**
 * Rate Limiting Configuration
 */

// Rate limit settings
export const RATE_LIMITS = {
  GENERATIONS_PER_MINUTE: 5,   // Max 5 generations per minute
  GENERATIONS_PER_DAY: 50,      // Max 50 generations per day (free tier)
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
  const limit = counterType === 'per_minute' 
    ? RATE_LIMITS.GENERATIONS_PER_MINUTE 
    : RATE_LIMITS.GENERATIONS_PER_DAY

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
      resetAt: new Date(Date.now() + 60 * 1000), // Default to 1 minute
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
  }

  if (!allowed) {
    const resetIn = Math.ceil((resetAt.getTime() - Date.now()) / 1000)
    const timeUnit = counterType === 'per_minute' ? 'seconds' : 'hours'
    const timeValue = counterType === 'per_minute' 
      ? resetIn 
      : Math.ceil(resetIn / 3600)

    result.message = `Rate limit exceeded. You've used ${current}/${limit} generations ${counterType === 'per_minute' ? 'this minute' : 'today'}. Try again in ${timeValue} ${timeUnit}.`
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
  perDay: { current: number; limit: number; remaining: number }
}> {
  const perMinuteCounter = await getOrCreateCounter(userId, 'per_minute')
  const perDayCounter = await getOrCreateCounter(userId, 'per_day')

  return {
    perMinute: {
      current: perMinuteCounter?.count || 0,
      limit: RATE_LIMITS.GENERATIONS_PER_MINUTE,
      remaining: Math.max(0, RATE_LIMITS.GENERATIONS_PER_MINUTE - (perMinuteCounter?.count || 0)),
    },
    perDay: {
      current: perDayCounter?.count || 0,
      limit: RATE_LIMITS.GENERATIONS_PER_DAY,
      remaining: Math.max(0, RATE_LIMITS.GENERATIONS_PER_DAY - (perDayCounter?.count || 0)),
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

