import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase/server'
import { getAsset, createAsset } from '@/lib/db/assets'
import { createGenerationJob, updateGenerationJob } from '@/lib/db/generation-jobs'
import { uploadFile, getSignedUrl, BUCKETS } from '@/lib/storage/server'
import { buildPrompt, type PromptInputs } from '@/lib/prompts'
import { checkAllRateLimits, recordGenerationUsage } from '@/lib/rate-limit'
import OpenAI from 'openai'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

// Initialize OpenAI client (server-side only)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * POST /api/generate
 * 
 * Trigger AI image generation using OpenAI DALL-E 2 (image editing)
 * 
 * Takes an uploaded product image and transforms it based on the selected mode
 * (main_white, lifestyle, feature_callout, packaging) using structured prompts.
 * 
 * Request (JSON):
 * - inputAssetId: string (required) - ID of the input asset
 * - mode: 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging' (required)
 * - productCategory: string (optional) - e.g., "electronics", "clothing"
 * - brandTone: string (optional) - e.g., "professional", "luxury"
 * - productDescription: string (optional) - e.g., "wireless headphones"
 * - constraints: string[] (optional) - Additional constraints
 * - promptVersion: string (optional, default: 'v1')
 * 
 * Process:
 * 1. Create generation_jobs row (status: 'queued')
 * 2. Fetch input image from storage
 * 3. Call OpenAI DALL-E 2 image edit API (image + prompt)
 * 4. Receive base64 image response
 * 5. Upload output to commercepix-outputs bucket
 * 6. Create assets row (kind: 'output', source_asset_id: input)
 * 7. Update generation_jobs (status: 'succeeded' or 'failed')
 * 
 * Response:
 * - job: Generation job object
 * - message: Status message
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireUser()

    // Check rate limits BEFORE any processing
    const rateLimitCheck = await checkAllRateLimits(user.id)

    if (!rateLimitCheck.allowed) {
      const blockedLimit = rateLimitCheck.blockedBy === 'per_minute' 
        ? rateLimitCheck.perMinute 
        : rateLimitCheck.perDay

      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: blockedLimit.message,
          rateLimit: {
            type: rateLimitCheck.blockedBy,
            limit: blockedLimit.limit,
            current: blockedLimit.current,
            remaining: blockedLimit.remaining,
            resetAt: blockedLimit.resetAt.toISOString(),
          }
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(blockedLimit.limit),
            'X-RateLimit-Remaining': String(blockedLimit.remaining),
            'X-RateLimit-Reset': blockedLimit.resetAt.toISOString(),
            'Retry-After': String(Math.ceil((blockedLimit.resetAt.getTime() - Date.now()) / 1000)),
          }
        }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      inputAssetId,
      mode,
      productCategory,
      brandTone,
      productDescription,
      constraints,
      promptVersion = 'v1',
    } = body

    // Validate required fields
    if (!inputAssetId) {
      return NextResponse.json(
        { error: 'Input asset ID is required' },
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

    // Fetch input asset
    const inputAsset = await getAsset(inputAssetId)

    if (!inputAsset) {
      return NextResponse.json(
        { error: 'Input asset not found' },
        { status: 404 }
      )
    }

    // Verify user owns the input asset
    if (inputAsset.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Create generation job (status defaults to 'queued' in createGenerationJob)
    const job = await createGenerationJob({
      project_id: inputAsset.project_id,
      mode,
      input_asset_id: inputAssetId,
      cost_cents: 0, // Will be updated after generation
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Failed to create generation job' },
        { status: 500 }
      )
    }

    // Start generation asynchronously (in a real app, this would be a background job)
    // For MVP, we'll do it inline but return the job immediately
    processGeneration(
      job.id,
      inputAsset,
      mode,
      {
        productCategory,
        brandTone,
        productDescription,
        constraints,
      },
      promptVersion,
      user.id
    ).catch(error => console.error('Background generation error:', error))

    // Record usage AFTER successful job creation
    await recordGenerationUsage(user.id)

    // Include rate limit info in response
    return NextResponse.json({
      job,
      message: 'Generation job created and processing',
      rateLimit: {
        perMinute: {
          current: rateLimitCheck.perMinute.current + 1, // +1 for this request
          limit: rateLimitCheck.perMinute.limit,
          remaining: Math.max(0, rateLimitCheck.perMinute.remaining - 1),
        },
        perDay: {
          current: rateLimitCheck.perDay.current + 1, // +1 for this request
          limit: rateLimitCheck.perDay.limit,
          remaining: Math.max(0, rateLimitCheck.perDay.remaining - 1),
        },
      },
    })
  } catch (error) {
    console.error('Generate API error:', error)
    
    // Check if it's a redirect (from requireUser)
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start generation' },
      { status: 500 }
    )
  }
}

/**
 * Process generation (runs asynchronously)
 */
async function processGeneration(
  jobId: string,
  inputAsset: any,
  mode: string,
  promptInputs: PromptInputs,
  promptVersion: string,
  userId: string
) {
  try {
    // Update job status to running
    await updateGenerationJob(jobId, { status: 'running' })

    // Build prompt using prompt library
    const { prompt, promptPayload } = buildPrompt(mode as any, promptInputs)

    console.log(`Generating image for job ${jobId} with mode: ${mode}`)
    console.log('Prompt:', prompt)

    // Download input image from storage
    const inputImageUrl = await getSignedUrl(
      BUCKETS.INPUTS,
      inputAsset.storage_path,
      3600 // 1 hour
    )

    if (!inputImageUrl.data?.signedUrl) {
      throw new Error('Failed to get signed URL for input image')
    }

    console.log('Downloading input image from storage...')
    const inputImageResponse = await fetch(inputImageUrl.data.signedUrl)
    if (!inputImageResponse.ok) {
      throw new Error('Failed to download input image from storage')
    }

    const inputImageBuffer = Buffer.from(await inputImageResponse.arrayBuffer())

    // Convert to File object for OpenAI API
    const inputFile = new File([inputImageBuffer], 'input.png', {
      type: inputAsset.mime_type || 'image/png',
    })

    console.log('Calling OpenAI DALL-E 2 image edit API...')
    
    // Call OpenAI DALL-E 2 Edit API (supports image + prompt)
    // Note: DALL-E 2 is used for image editing, DALL-E 3 only supports text-to-image
    const response = await openai.images.edit({
      model: 'dall-e-2',
      image: inputFile,
      prompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json', // Get base64 to avoid extra download
    })

    const b64Image = response.data?.[0]?.b64_json

    if (!b64Image) {
      throw new Error('No image data returned from OpenAI')
    }

    console.log('Received generated image from OpenAI')

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(b64Image, 'base64')

    // Generate output asset ID
    const outputAssetId = uuidv4()

    // Upload to storage
    const storagePath = `${userId}/${inputAsset.project_id}/${outputAssetId}.png`
    const uploadResult = await uploadFile(
      BUCKETS.OUTPUTS,
      storagePath,
      imageBuffer,
      {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false,
      }
    )

    if (uploadResult.error) {
      throw new Error('Failed to upload generated image to storage')
    }

    // Create output asset record
    const outputAsset = await createAsset({
      project_id: inputAsset.project_id,
      kind: 'output',
      mode: mode as any,
      source_asset_id: inputAsset.id,
      prompt_version: promptVersion,
      prompt_payload: promptPayload, // Store the full audit trail
      width: 1024,
      height: 1024,
      mime_type: 'image/png',
      storage_path: storagePath,
    })

    // Calculate cost (DALL-E 2 edit: $0.020 per image = 2 cents)
    const costCents = 2

    // Update job as succeeded
    await updateGenerationJob(jobId, {
      status: 'succeeded',
      cost_cents: costCents,
    })

    console.log(`Generation job ${jobId} completed successfully. Output asset: ${outputAssetId}`)
  } catch (error) {
    console.error(`Generation job ${jobId} failed:`, error)

    // Update job as failed
    await updateGenerationJob(jobId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Generation failed',
    })
  }
}

