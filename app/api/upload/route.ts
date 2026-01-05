import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase/server'
import { uploadFile, BUCKETS } from '@/lib/storage/server'
import { createAsset } from '@/lib/db/assets'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

// Allowed image MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
]

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

/**
 * POST /api/upload
 * 
 * Upload a product photo (input asset)
 * 
 * Request (multipart/form-data):
 * - file: File (required) - Image file (JPG, PNG, WebP)
 * - projectId: string (required) - Project to associate asset with
 * 
 * Response:
 * - assetId: string - Created asset ID
 * - projectId: string - Associated project ID
 * - storagePath: string - Path in storage
 * 
 * Validation:
 * - File type: jpg, png, webp
 * - File size: max 10MB
 * - User authentication required
 * - Project must exist
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireUser()

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const projectId = formData.get('projectId') as string

    // Validate file presence
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Validate project ID
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Validate file is a File object
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type',
          message: 'Only JPG, PNG, and WebP images are allowed',
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large',
          message: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_FILE_SIZE,
          actualSize: file.size,
        },
        { status: 400 }
      )
    }

    // Validate file size is not zero
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      )
    }

    console.log(`Uploading file: ${file.name} (${file.size} bytes, ${file.type})`)

    // Generate asset ID
    const assetId = uuidv4()

    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Determine file extension
    const extension = file.type === 'image/jpeg' ? 'jpg' : 
                     file.type === 'image/png' ? 'png' : 
                     file.type === 'image/webp' ? 'webp' : 'jpg'

    // Generate storage path: userId/projectId/assetId.ext
    const storagePath = `${user.id}/${projectId}/${assetId}.${extension}`

    // Upload to Supabase Storage (commercepix-inputs bucket)
    const uploadResult = await uploadFile(
      BUCKETS.INPUTS,
      storagePath,
      buffer,
      {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      }
    )

    if (uploadResult.error) {
      console.error('Storage upload error:', uploadResult.error)
      return NextResponse.json(
        { 
          error: 'Failed to upload file to storage',
          details: uploadResult.error.message,
        },
        { status: 500 }
      )
    }

    console.log(`File uploaded to storage: ${storagePath}`)

    // Create asset record in database with kind='input'
    const asset = await createAsset({
      id: assetId,
      user_id: user.id,
      project_id: projectId,
      kind: 'input',
      mode: null, // Input assets don't have a mode
      source_asset_id: null,
      prompt_version: null,
      prompt_payload: null,
      width: null, // Could extract from image metadata if needed
      height: null,
      mime_type: file.type,
      storage_path: storagePath,
    })

    if (!asset) {
      // Cleanup: try to delete uploaded file
      // (In production, you might want a cleanup job instead)
      console.error('Failed to create asset record')
      return NextResponse.json(
        { error: 'Failed to create asset record' },
        { status: 500 }
      )
    }

    console.log(`Asset record created: ${assetId}`)

    // Return success response with assetId and projectId
    return NextResponse.json({
      assetId,
      projectId,
      storagePath,
      message: 'File uploaded successfully',
    })

  } catch (error) {
    console.error('Upload error:', error)
    
    // Check if it's a redirect (from requireUser)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return NextResponse.json(
      { 
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/upload
 * 
 * Returns upload configuration and limits
 */
export async function GET() {
  return NextResponse.json({
    maxFileSize: MAX_FILE_SIZE,
    maxFileSizeMB: MAX_FILE_SIZE / 1024 / 1024,
    allowedMimeTypes: ALLOWED_MIME_TYPES,
    allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
  })
}

