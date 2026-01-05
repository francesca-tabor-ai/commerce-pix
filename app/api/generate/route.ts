import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase/server'
import { getAsset, createAsset } from '@/lib/db/assets'
import { createGenerationJob, updateGenerationJob } from '@/lib/db/generation-jobs'
import { uploadFile, getSignedUrl, BUCKETS } from '@/lib/storage/server'
import { buildPrompt, type PromptInputs } from '@/lib/prompts'
import { checkAllRateLimits, recordGenerationUsage } from '@/lib/rate-limit'
import { spendCredits, hasSufficientCredits } from '@/lib/db/billing'
import { markMainImageGenerated, markLifestyleImageGenerated } from '@/lib/db/onboarding'
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
 * Generate AI product images using OpenAI DALL-E 2 image editing
 * 
 * Transforms uploaded product images based on selected mode using Amazon-focused prompts.
 * Handles credits, job tracking, OpenAI integration, and output storage.
 * 
 * Request (JSON):
 * - projectId: string (required) - Project UUID
 * - inputAssetId: string (required) - Input asset UUID
 * - mode: 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging' (required)
 * - productCategory: string (optional) - e.g., "electronics", "clothing"
 * - brandTone: string (optional) - e.g., "professional", "luxury"
 * - productDescription: string (optional) - e.g., "wireless headphones"
 * - constraints: string[] (optional) - Additional constraints
 * - promptVersion: string (optional, default: 'v1')
 * 
 * Flow:
 * 1. Authenticate user
 * 2. Validate project ownership
 * 3. Check credits >= 1 (return 402 if insufficient)
 * 4. Create generation_jobs row (status: 'queued')
 * 5. Process generation asynchronously:
 *    a. Update job status to 'running'
 *    b. Build Amazon-compliant prompt
 *    c. Call OpenAI DALL-E 2 API
 *    d. Upload output to commercepix-outputs bucket
 *    e. Create assets row (kind='output', source_asset_id, mode, prompt_payload)
 *    f. Spend 1 credit (insert into credit_ledger)
 *    g. Mark job 'succeeded'
 * 6. On failure: Mark job 'failed', do NOT spend credits
 * 
 * Response (200):
 * - jobId: string - Generation job UUID
 * - message: string - Status message
 * - rateLimit: object - Rate limit info
 * 
 * Errors:
 * - 400: Missing/invalid parameters
 * - 402: Insufficient credits (code: 'NO_CREDITS')
 * - 403: Unauthorized (not asset owner)
 * - 404: Asset not found
 * - 429: Rate limit exceeded
 * - 500: Server error
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

      const isPerMinuteLimit = rateLimitCheck.blockedBy === 'per_minute'
      const isDailyLimit = rateLimitCheck.blockedBy === 'per_day'
      const upgradeRequired = blockedLimit.upgradeRequired || false
      const isTrialUser = blockedLimit.isTrialUser || false

      // Return friendly error with upgrade CTA if applicable
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: blockedLimit.message,
          code: upgradeRequired ? 'UPGRADE_REQUIRED' : 'RATE_LIMIT_EXCEEDED',
          rateLimit: {
            type: rateLimitCheck.blockedBy,
            limit: blockedLimit.limit,
            current: blockedLimit.current,
            remaining: blockedLimit.remaining,
            resetAt: blockedLimit.resetAt.toISOString(),
            isPerMinuteLimit,
            isDailyLimit,
            upgradeRequired,
            isTrialUser,
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

    // Check if user has sufficient credits (1 credit per generation)
    const hasCredits = await hasSufficientCredits(user.id, 1)

    if (!hasCredits) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits',
          message: 'You do not have enough credits to generate an image. Please upgrade your plan.',
          code: 'NO_CREDITS'
        },
        { status: 402 } // 402 Payment Required
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
      projectId,
      inputAssetId,
      mode,
      productCategory,
      brandTone,
      productDescription,
      constraints,
      promptVersion = 'v1',
    } = body

    // Validate required fields
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

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
        { error: 'Unauthorized: You do not own this asset' },
        { status: 403 }
      )
    }

    // Verify input asset belongs to the specified project
    if (inputAsset.project_id !== projectId) {
      return NextResponse.json(
        { error: 'Asset does not belong to the specified project' },
        { status: 400 }
      )
    }

    // Estimate cost (DALL-E 2 edit: $0.020 per image = 2 cents)
    const estimatedCostCents = 2

    // Create generation job (status defaults to 'queued' in createGenerationJob)
    const job = await createGenerationJob({
      project_id: projectId,
      mode,
      input_asset_id: inputAssetId,
      cost_cents: estimatedCostCents,
    })

    if (!job) {
      return NextResponse.json(
        { error: 'Failed to create generation job' },
        { status: 500 }
      )
    }

    // Start generation asynchronously
    // Note: Credits are only spent AFTER successful generation
    // If generation fails, job is marked 'failed' and credits are NOT spent
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

    // Record usage AFTER successful job creation (for rate limiting)
    await recordGenerationUsage(user.id)

    // Return job ID and status
    return NextResponse.json({
      jobId: job.id,
      message: 'Generation job created and processing',
      status: 'queued',
      rateLimit: {
        perMinute: {
          current: rateLimitCheck.perMinute.current + 1,
          limit: rateLimitCheck.perMinute.limit,
          remaining: Math.max(0, rateLimitCheck.perMinute.remaining - 1),
        },
        perDay: {
          current: rateLimitCheck.perDay.current + 1,
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

    // Generate unique filename for storage
    const uniqueFilename = uuidv4()

    // Upload to storage
    const storagePath = `${userId}/${inputAsset.project_id}/${uniqueFilename}.png`
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
    // Note: ID and user_id are auto-generated/set by createAsset
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

    if (!outputAsset) {
      throw new Error('Failed to create output asset record')
    }

    console.log(`   Created output asset: ${outputAsset.id}`)

    // Calculate actual cost (DALL-E 2 edit: $0.020 per image = 2 cents)
    const costCents = 2

    // Spend 1 credit for the successful generation
    // This must happen BEFORE marking job as succeeded
    // If credit spending fails, the entire generation is rolled back
    const creditResult = await spendCredits(userId, 1, 'generation', 'job', jobId)
    
    if (!creditResult.success) {
      throw new Error(`Failed to spend credits: ${creditResult.error}`)
    }

    console.log(`   Credits spent: 1`)

    // Update job as succeeded (only after credits are spent)
    await updateGenerationJob(jobId, {
      status: 'succeeded',
      cost_cents: costCents,
    })

    // Track onboarding progress based on mode
    try {
      if (mode === 'main_white') {
        await markMainImageGenerated(userId)
      } else if (mode === 'lifestyle') {
        await markLifestyleImageGenerated(userId)
      }
    } catch (error) {
      // Don't fail generation if onboarding tracking fails
      console.error('Failed to update onboarding progress:', error)
    }

    console.log(`✅ Generation job ${jobId} completed successfully`)
    console.log(`   Output asset: ${outputAsset.id}`)
    console.log(`   Storage path: ${storagePath}`)
    console.log(`   Cost: $${(costCents / 100).toFixed(2)}`)
  } catch (error) {
    console.error(`❌ Generation job ${jobId} failed:`, error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown generation error'

    // Update job as failed
    // CRITICAL: Do NOT spend credits when generation fails
    await updateGenerationJob(jobId, {
      status: 'failed',
      error: errorMessage,
    })

    console.log(`   Job ${jobId} marked as failed`)
    console.log(`   Credits NOT spent (generation failed)`)
    console.log(`   Error: ${errorMessage}`)
  }
}

