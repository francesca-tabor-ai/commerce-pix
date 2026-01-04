import { NextRequest, NextResponse } from 'next/server'
import { getSignedUrl, BUCKETS } from '@/lib/storage/server'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Ensure user is authenticated
    await requireUser()

    // Parse request body
    const body = await request.json()
    const { bucket, path, expiresIn = 3600 } = body

    // Validate inputs
    if (!bucket || !Object.values(BUCKETS).includes(bucket as any)) {
      return NextResponse.json({ error: 'Invalid bucket name' }, { status: 400 })
    }

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Generate signed URL
    const result = await getSignedUrl(bucket as any, path, expiresIn)

    if (result.error) {
      console.error('Signed URL generation error:', result.error)
      return NextResponse.json(
        { error: result.error.message || 'Failed to generate signed URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signedUrl: result.data?.signedUrl,
      expiresIn,
    })
  } catch (error) {
    console.error('Signed URL API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate signed URL' },
      { status: 500 }
    )
  }
}

