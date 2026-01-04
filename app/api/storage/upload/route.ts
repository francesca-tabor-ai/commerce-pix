import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, BUCKETS } from '@/lib/storage/server'
import { getSignedUrl } from '@/lib/storage/server'
import { requireUser } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Ensure user is authenticated
    const user = await requireUser()

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string
    const userId = formData.get('userId') as string

    // Validate inputs
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!bucket || !Object.values(BUCKETS).includes(bucket as any)) {
      return NextResponse.json({ error: 'Invalid bucket name' }, { status: 400 })
    }

    // Ensure user can only upload to their own folder
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Generate file path: userId/timestamp-filename
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const path = `${userId}/${timestamp}-${sanitizedFilename}`

    // Get file content type
    const contentType = file.type || 'application/octet-stream'

    // Upload file
    const result = await uploadFile(bucket as any, path, file, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    })

    if (result.error) {
      console.error('Upload error:', result.error)
      return NextResponse.json(
        { error: result.error.message || 'Upload failed' },
        { status: 500 }
      )
    }

    // Generate signed URL for the uploaded file
    const signedUrlResult = await getSignedUrl(bucket as any, path, 3600)

    return NextResponse.json({
      success: true,
      path,
      signedUrl: signedUrlResult.data?.signedUrl || null,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}

