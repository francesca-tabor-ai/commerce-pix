import { NextRequest, NextResponse } from 'next/server'
import { deleteFile, BUCKETS } from '@/lib/storage/server'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Ensure user is authenticated
    const user = await requireUser()

    // Parse request body
    const body = await request.json()
    const { bucket, path } = body

    // Validate inputs
    if (!bucket || !Object.values(BUCKETS).includes(bucket as any)) {
      return NextResponse.json({ error: 'Invalid bucket name' }, { status: 400 })
    }

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Ensure user can only delete files in their own folder
    if (!path.startsWith(user.id + '/')) {
      return NextResponse.json(
        { error: 'You can only delete files in your own folder' },
        { status: 403 }
      )
    }

    // Delete file
    const result = await deleteFile(bucket as any, path)

    if (result.error) {
      console.error('Delete error:', result.error)
      return NextResponse.json(
        { error: result.error.message || 'Failed to delete file' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    })
  } catch (error) {
    console.error('Delete API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete file' },
      { status: 500 }
    )
  }
}

