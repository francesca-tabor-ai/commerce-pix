import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase/server'
import { uploadAsset, BUCKETS } from '@/lib/storage/server'
import { createAsset } from '@/lib/db/assets'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

/**
 * POST /api/assets/upload
 * 
 * Upload an input image asset
 * 
 * Request (multipart/form-data):
 * - file: File (required)
 * - projectId: string (required)
 * - mode: 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging' (required)
 * - promptVersion: string (optional, default: 'v1')
 * - promptPayload: JSON string (optional, default: '{}')
 * 
 * Response:
 * - asset: Asset object with id, storage_path, etc.
 * - signedUrl: Temporary signed URL for immediate display
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireUser()

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string
    const mode = formData.get('mode') as string
    const promptVersion = (formData.get('promptVersion') as string) || 'v1'
    const promptPayloadStr = (formData.get('promptPayload') as string) || '{}'

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    const validModes = ['main_white', 'lifestyle', 'feature_callout', 'packaging']
    if (!mode || !validModes.includes(mode)) {
      return NextResponse.json(
        { error: `Mode must be one of: ${validModes.join(', ')}` },
        { status: 400 }
      )
    }

    // Parse prompt payload
    let promptPayload
    try {
      promptPayload = JSON.parse(promptPayloadStr)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid prompt payload JSON' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 50MB' },
        { status: 400 }
      )
    }

    // Generate asset ID
    const assetId = uuidv4()

    // Get image dimensions (if possible)
    let width: number | undefined
    let height: number | undefined
    
    // For browser File objects, we can't easily get dimensions server-side
    // This would typically be sent from the client or extracted using sharp/jimp
    // For now, we'll leave them undefined and can add later

    // Upload file to storage
    const uploadResult = await uploadAsset(
      BUCKETS.INPUTS,
      user.id,
      projectId,
      assetId,
      file,
      file.name
    )

    if (uploadResult.error) {
      console.error('Storage upload error:', uploadResult.error)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // Create asset record in database
    const asset = await createAsset({
      id: assetId,
      user_id: user.id,
      project_id: projectId,
      kind: 'input',
      mode: mode as any,
      prompt_version: promptVersion,
      prompt_payload: promptPayload,
      width,
      height,
      mime_type: file.type,
      storage_path: uploadResult.path!,
    })

    // Generate signed URL for immediate display
    const { getSignedUrl } = await import('@/lib/storage/server')
    const signedUrlResult = await getSignedUrl(
      BUCKETS.INPUTS,
      uploadResult.path!,
      3600
    )

    return NextResponse.json({
      asset,
      signedUrl: signedUrlResult.data?.signedUrl || null,
    })
  } catch (error) {
    console.error('Asset upload error:', error)
    
    // Check if it's a redirect (from requireUser)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload asset' },
      { status: 500 }
    )
  }
}

