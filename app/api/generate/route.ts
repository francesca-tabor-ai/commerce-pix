import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/supabase/server'
import { getAsset, createAsset } from '@/lib/db/assets'
import { createGenerationJob, updateGenerationJob } from '@/lib/db/generation-jobs'
import { uploadFile, getSignedUrl, BUCKETS } from '@/lib/storage/server'
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
 * Trigger AI image generation using OpenAI DALL-E
 * 
 * Request (JSON):
 * - inputAssetId: string (required) - ID of the input asset
 * - mode: 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging' (required)
 * - prompt: string (optional) - Custom prompt override
 * - promptVersion: string (optional, default: 'v1')
 * - promptPayload: object (optional, default: {}) - Structured prompt parameters
 * 
 * Response:
 * - job: Generation job object
 * - outputAsset: Output asset object (if generation succeeds immediately)
 * - signedUrl: Signed URL for the generated image (if available)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireUser()

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
      prompt: customPrompt,
      promptVersion = 'v1',
      promptPayload = {},
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

    // Create generation job
    const job = await createGenerationJob({
      user_id: user.id,
      project_id: inputAsset.project_id,
      status: 'queued',
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
    processGeneration(job.id, inputAsset, mode, customPrompt, promptVersion, promptPayload, user.id)
      .catch(error => console.error('Background generation error:', error))

    return NextResponse.json({
      job,
      message: 'Generation job created and processing',
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
  customPrompt: string | undefined,
  promptVersion: string,
  promptPayload: any,
  userId: string
) {
  try {
    // Update job status to running
    await updateGenerationJob(jobId, { status: 'running' })

    // Build prompt based on mode
    const prompt = customPrompt || buildPrompt(mode, inputAsset, promptPayload)

    console.log(`Generating image for job ${jobId} with prompt: ${prompt}`)

    // Call OpenAI DALL-E API
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    })

    const imageUrl = response.data[0]?.url

    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI')
    }

    // Download the generated image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('Failed to download generated image')
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

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
      id: outputAssetId,
      user_id: userId,
      project_id: inputAsset.project_id,
      kind: 'output',
      mode: mode as any,
      source_asset_id: inputAsset.id,
      prompt_version: promptVersion,
      prompt_payload: { ...promptPayload, prompt },
      width: 1024,
      height: 1024,
      mime_type: 'image/png',
      storage_path: storagePath,
    })

    // Calculate cost (DALL-E 3 standard: $0.040 per image = 4 cents)
    const costCents = 4

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

/**
 * Build prompt based on mode and input asset
 */
function buildPrompt(mode: string, inputAsset: any, promptPayload: any): string {
  const baseDescription = promptPayload.description || 'a product'

  switch (mode) {
    case 'main_white':
      return `Create a professional product photo of ${baseDescription} on a pure white background. The product should be centered, well-lit, and showcase all key features clearly. High-resolution, commercial photography style, perfect for e-commerce.`

    case 'lifestyle':
      return `Create a lifestyle product photo of ${baseDescription} being used in a real-world setting. Show the product in context with natural lighting, authentic environment, and relatable scenario. The image should feel organic and appealing to customers.`

    case 'feature_callout':
      return `Create a product photo of ${baseDescription} that highlights its key features and benefits. Use visual cues like arrows, labels, or zoom-ins to emphasize important details. Clean, informative, and marketing-focused composition.`

    case 'packaging':
      return `Create a product photo of ${baseDescription} in its retail packaging. Show the complete package design from an appealing angle, with clear branding visible. Professional retail photography style suitable for online stores.`

    default:
      return `Create a high-quality professional photo of ${baseDescription}.`
  }
}

