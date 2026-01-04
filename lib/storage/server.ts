import 'server-only'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase Storage Helper Functions
 * 
 * These functions provide server-side file upload, signed URL generation,
 * and file deletion for Supabase Storage buckets.
 */

// Storage bucket names
export const BUCKETS = {
  INPUTS: 'commercepix-inputs',
  OUTPUTS: 'commercepix-outputs',
} as const

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS]

/**
 * Upload a file to Supabase Storage
 * 
 * @param bucket - Bucket name ('commercepix-inputs' or 'commercepix-outputs')
 * @param path - File path within the bucket (e.g., 'user-id/project-id/filename.jpg')
 * @param file - File to upload (File, Blob, or Buffer)
 * @param options - Upload options (contentType, cacheControl, upsert)
 * @returns Upload result with path and error
 * 
 * @example
 * const result = await uploadFile(
 *   BUCKETS.INPUTS,
 *   `${userId}/${projectId}/image.jpg`,
 *   file,
 *   { contentType: 'image/jpeg' }
 * )
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File | Blob | Buffer | ArrayBuffer,
  options?: {
    contentType?: string
    cacheControl?: string
    upsert?: boolean
  }
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: options?.contentType,
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false,
      })

    if (error) {
      console.error(`Error uploading file to ${bucket}:`, error)
      return { data: null, error }
    }

    console.log(`File uploaded successfully to ${bucket}/${path}`)
    return { data, error: null }
  } catch (err) {
    console.error(`Exception uploading file to ${bucket}:`, err)
    return { 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Unknown error' } 
    }
  }
}

/**
 * Generate a signed URL for a private file
 * 
 * @param bucket - Bucket name
 * @param path - File path within the bucket
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL with expiration
 * 
 * @example
 * const result = await getSignedUrl(
 *   BUCKETS.INPUTS,
 *   `${userId}/${projectId}/image.jpg`,
 *   3600
 * )
 * if (result.data) {
 *   console.log(result.data.signedUrl)
 * }
 */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn: number = 3600
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      console.error(`Error generating signed URL for ${bucket}/${path}:`, error)
      return { data: null, error }
    }

    console.log(`Signed URL generated for ${bucket}/${path} (expires in ${expiresIn}s)`)
    return { data, error: null }
  } catch (err) {
    console.error(`Exception generating signed URL:`, err)
    return { 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Unknown error' } 
    }
  }
}

/**
 * Get multiple signed URLs at once
 * 
 * @param bucket - Bucket name
 * @param paths - Array of file paths
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Array of signed URLs
 */
export async function getSignedUrls(
  bucket: BucketName,
  paths: string[],
  expiresIn: number = 3600
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrls(paths, expiresIn)

    if (error) {
      console.error(`Error generating signed URLs for ${bucket}:`, error)
      return { data: null, error }
    }

    console.log(`Generated ${paths.length} signed URLs for ${bucket}`)
    return { data, error: null }
  } catch (err) {
    console.error(`Exception generating signed URLs:`, err)
    return { 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Unknown error' } 
    }
  }
}

/**
 * Delete a file from storage
 * 
 * @param bucket - Bucket name
 * @param path - File path to delete
 * @returns Deletion result
 * 
 * @example
 * const result = await deleteFile(
 *   BUCKETS.INPUTS,
 *   `${userId}/${projectId}/image.jpg`
 * )
 */
export async function deleteFile(bucket: BucketName, path: string) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      console.error(`Error deleting file from ${bucket}/${path}:`, error)
      return { data: null, error }
    }

    console.log(`File deleted successfully from ${bucket}/${path}`)
    return { data, error: null }
  } catch (err) {
    console.error(`Exception deleting file:`, err)
    return { 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Unknown error' } 
    }
  }
}

/**
 * Delete multiple files at once
 * 
 * @param bucket - Bucket name
 * @param paths - Array of file paths to delete
 * @returns Deletion result
 */
export async function deleteFiles(bucket: BucketName, paths: string[]) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(paths)

    if (error) {
      console.error(`Error deleting files from ${bucket}:`, error)
      return { data: null, error }
    }

    console.log(`Deleted ${paths.length} files from ${bucket}`)
    return { data, error: null }
  } catch (err) {
    console.error(`Exception deleting files:`, err)
    return { 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Unknown error' } 
    }
  }
}

/**
 * List files in a bucket folder
 * 
 * @param bucket - Bucket name
 * @param path - Folder path (optional, defaults to root)
 * @param options - List options (limit, offset, sortBy)
 * @returns List of files
 */
export async function listFiles(
  bucket: BucketName,
  path?: string,
  options?: {
    limit?: number
    offset?: number
    sortBy?: { column: string; order: 'asc' | 'desc' }
  }
) {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: options?.limit,
        offset: options?.offset,
        sortBy: options?.sortBy,
      })

    if (error) {
      console.error(`Error listing files in ${bucket}/${path}:`, error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error(`Exception listing files:`, err)
    return { 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Unknown error' } 
    }
  }
}

/**
 * Get public URL for a file (works for public buckets only)
 * For private buckets, use getSignedUrl instead
 * 
 * @param bucket - Bucket name
 * @param path - File path
 * @returns Public URL
 */
export function getPublicUrl(bucket: BucketName, path: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  
  if (!supabaseUrl) {
    return { 
      data: null, 
      error: { message: 'Supabase URL not configured' } 
    }
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  
  return { 
    data: { publicUrl }, 
    error: null 
  }
}

/**
 * Generate a storage path for an asset
 * Format: userId/projectId/assetId.extension
 * 
 * @param userId - User ID
 * @param projectId - Project ID
 * @param assetId - Asset ID
 * @param filename - Original filename (to extract extension)
 * @returns Storage path
 * 
 * @example
 * const path = generateAssetPath(userId, projectId, assetId, 'photo.jpg')
 * // Returns: 'user-123/project-456/asset-789.jpg'
 */
export function generateAssetPath(
  userId: string,
  projectId: string,
  assetId: string,
  filename: string
): string {
  const extension = filename.split('.').pop() || 'bin'
  return `${userId}/${projectId}/${assetId}.${extension}`
}

/**
 * Upload an asset with automatic path generation
 * 
 * @param bucket - Bucket name
 * @param userId - User ID
 * @param projectId - Project ID
 * @param assetId - Asset ID
 * @param file - File to upload
 * @param filename - Original filename
 * @returns Upload result with generated path
 */
export async function uploadAsset(
  bucket: BucketName,
  userId: string,
  projectId: string,
  assetId: string,
  file: File | Blob | Buffer | ArrayBuffer,
  filename: string
) {
  const path = generateAssetPath(userId, projectId, assetId, filename)
  
  // Determine content type
  const extension = filename.split('.').pop()?.toLowerCase()
  const contentType = getContentType(extension || '')

  const result = await uploadFile(bucket, path, file, {
    contentType,
    cacheControl: '3600',
    upsert: false,
  })

  if (result.error) {
    return { data: null, error: result.error, path: null }
  }

  return { data: result.data, error: null, path }
}

/**
 * Get content type from file extension
 */
function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    mp4: 'video/mp4',
    webm: 'video/webm',
  }

  return contentTypes[extension] || 'application/octet-stream'
}

