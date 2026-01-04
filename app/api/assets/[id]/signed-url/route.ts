import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase/server'
import { getAsset } from '@/lib/db/assets'
import { getSignedUrl, BUCKETS } from '@/lib/storage/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/assets/[id]/signed-url
 * 
 * Get a signed URL for an asset
 * 
 * Query parameters:
 * - expiresIn: number (optional, default: 3600 seconds = 1 hour)
 * 
 * Response:
 * - signedUrl: Temporary signed URL
 * - expiresIn: Expiration time in seconds
 * - asset: Asset metadata
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const user = await requireUser()

    const assetId = params.id

    // Get expiration time from query params
    const { searchParams } = new URL(request.url)
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600')

    // Validate expiresIn
    if (expiresIn < 1 || expiresIn > 604800) { // Max 7 days
      return NextResponse.json(
        { error: 'expiresIn must be between 1 and 604800 seconds (7 days)' },
        { status: 400 }
      )
    }

    // Fetch asset from database
    const asset = await getAsset(assetId)

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Verify user owns the asset (RLS should handle this, but double-check)
    if (asset.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Determine bucket based on asset kind
    const bucket = asset.kind === 'input' ? BUCKETS.INPUTS : BUCKETS.OUTPUTS

    // Generate signed URL
    const result = await getSignedUrl(bucket, asset.storage_path, expiresIn)

    if (result.error) {
      console.error('Signed URL generation error:', result.error)
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signedUrl: result.data?.signedUrl,
      expiresIn,
      asset: {
        id: asset.id,
        kind: asset.kind,
        mode: asset.mode,
        width: asset.width,
        height: asset.height,
        mime_type: asset.mime_type,
        created_at: asset.created_at,
      },
    })
  } catch (error) {
    console.error('Get signed URL error:', error)
    
    // Check if it's a redirect (from requireUser)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get signed URL' },
      { status: 500 }
    )
  }
}

