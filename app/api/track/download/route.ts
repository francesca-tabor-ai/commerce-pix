import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase/server'
import { markAssetDownloaded } from '@/lib/db/onboarding'

export const dynamic = 'force-dynamic'

/**
 * POST /api/track/download
 * 
 * Track when a user downloads an asset (for onboarding checklist)
 * 
 * Request (JSON):
 * - assetId: string (optional) - The asset being downloaded
 * 
 * Response:
 * - success: boolean
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()

    // Mark onboarding task complete
    await markAssetDownloaded(user.id)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error tracking download:', error)
    
    // Don't fail the download if tracking fails
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track download',
    }, { status: 500 })
  }
}

