import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase/server'
import { getUserUsageStats, RATE_LIMITS } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/**
 * GET /api/rate-limit/status
 * 
 * Get current rate limit status for the authenticated user
 * 
 * Response:
 * - perMinute: Current usage vs limit for per-minute rate limit
 * - perDay: Current usage vs limit for per-day rate limit
 * - limits: Configured rate limit values
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireUser()

    // Get usage stats
    const stats = await getUserUsageStats(user.id)

    return NextResponse.json({
      perMinute: stats.perMinute,
      perDay: stats.perDay,
      limits: {
        generationsPerMinute: RATE_LIMITS.GENERATIONS_PER_MINUTE,
        generationsPerDay: RATE_LIMITS.GENERATIONS_PER_DAY,
      },
    })
  } catch (error) {
    console.error('Rate limit status API error:', error)
    
    // Check if it's a redirect (from requireUser)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get rate limit status' },
      { status: 500 }
    )
  }
}

