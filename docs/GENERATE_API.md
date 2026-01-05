# Generate API Documentation

Complete guide for generating AI product images with CommercePix.

## Overview

The Generate API (`POST /api/generate`) orchestrates the entire AI image generation workflow, from credit validation to OpenAI integration to output storage. It handles authentication, project ownership, credit management, job tracking, and error handling.

## Endpoint

### `POST /api/generate`

Generate AI-enhanced product images using OpenAI DALL-E 2.

**URL:** `/api/generate`  
**Method:** `POST`  
**Auth Required:** Yes (session-based)  
**Credits Required:** 1 credit per generation

---

## Request

### Headers

```
Content-Type: application/json
Cookie: [session cookie]
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectId` | string | ✅ Yes | Project UUID |
| `inputAssetId` | string | ✅ Yes | Input asset UUID |
| `mode` | string | ✅ Yes | Generation mode (see below) |
| `productCategory` | string | ❌ No | Product category (e.g., "electronics") |
| `brandTone` | string | ❌ No | Brand tone (e.g., "professional") |
| `productDescription` | string | ❌ No | Product description |
| `constraints` | string[] | ❌ No | Additional prompt constraints |
| `promptVersion` | string | ❌ No | Prompt version (default: 'v1') |

### Generation Modes

| Mode | Description | Amazon Use Case |
|------|-------------|-----------------|
| `main_white` | Pure white background, no props | Main product image |
| `lifestyle` | Product in real-world context | Secondary lifestyle shot |
| `feature_callout` | Highlight 3 key benefits | Feature highlight image |
| `packaging` | Product in retail packaging | Package shot |

### Example Request

```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    projectId: '550e8400-e29b-41d4-a716-446655440000',
    inputAssetId: '660e8400-e29b-41d4-a716-446655440001',
    mode: 'main_white',
    productCategory: 'electronics',
    brandTone: 'professional',
    productDescription: 'wireless Bluetooth headphones',
  }),
})

const data = await response.json()
```

---

## Response

### Success Response (200 OK)

```json
{
  "jobId": "770e8400-e29b-41d4-a716-446655440002",
  "message": "Generation job created and processing",
  "status": "queued",
  "rateLimit": {
    "perMinute": {
      "current": 1,
      "limit": 10,
      "remaining": 9
    },
    "perDay": {
      "current": 1,
      "limit": 100,
      "remaining": 99
    }
  }
}
```

**Fields:**
- `jobId` - UUID of the generation job (use to poll status)
- `message` - Human-readable status message
- `status` - Initial job status ("queued")
- `rateLimit` - Current rate limit usage

### Error Responses

#### 400 Bad Request

**Missing Required Field:**
```json
{
  "error": "Project ID is required"
}
```

**Invalid Mode:**
```json
{
  "error": "Mode must be one of: main_white, lifestyle, feature_callout, packaging"
}
```

**Asset/Project Mismatch:**
```json
{
  "error": "Asset does not belong to the specified project"
}
```

#### 402 Payment Required (Insufficient Credits)

```json
{
  "error": "Insufficient credits",
  "message": "You do not have enough credits to generate an image. Please upgrade your plan.",
  "code": "NO_CREDITS"
}
```

**Status Code:** `402`  
**Frontend Action:** Display upgrade modal

#### 403 Forbidden (Not Owner)

```json
{
  "error": "Unauthorized: You do not own this asset"
}
```

#### 404 Not Found (Asset Missing)

```json
{
  "error": "Input asset not found"
}
```

#### 429 Too Many Requests (Rate Limit)

```json
{
  "error": "Rate limit exceeded",
  "message": "You have exceeded the rate limit. Please try again later.",
  "rateLimit": {
    "type": "per_minute",
    "limit": 10,
    "current": 11,
    "remaining": 0,
    "resetAt": "2026-01-05T12:05:00.000Z"
  }
}
```

**Headers:**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-01-05T12:05:00.000Z
Retry-After: 45
```

#### 500 Internal Server Error

```json
{
  "error": "Failed to create generation job"
}
```

---

## Generation Flow

### Complete Workflow

```
1. Client sends POST /api/generate request
   ↓
2. Server validates authentication
   ↓
3. Server checks rate limits (per-minute & per-day)
   ↓
4. Server checks credit balance (>= 1 credit required)
   ↓
5. Server validates project ownership
   ↓
6. Server validates asset ownership and project match
   ↓
7. Server creates generation_jobs row (status: 'queued')
   ↓
8. Server returns jobId immediately (202-style async)
   ↓
9. Background processing begins:
   ├─ Update job status to 'running'
   ├─ Build Amazon-compliant prompt
   ├─ Download input image from storage
   ├─ Call OpenAI DALL-E 2 API
   ├─ Upload generated image to storage
   ├─ Create output asset record
   ├─ Spend 1 credit (only if successful)
   └─ Update job status to 'succeeded'
   ↓
10. Client polls /api/jobs/[jobId] for status
   ↓
11. When job succeeds, client fetches output asset
```

### Success Path

```typescript
// 1. Submit generation request
const generateResponse = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ projectId, inputAssetId, mode, ...params }),
})

const { jobId } = await generateResponse.json()

// 2. Poll job status
const pollInterval = setInterval(async () => {
  const statusResponse = await fetch(`/api/jobs/${jobId}`)
  const job = await statusResponse.json()
  
  if (job.status === 'succeeded') {
    clearInterval(pollInterval)
    console.log('Generation complete!')
    // Fetch and display output asset
  } else if (job.status === 'failed') {
    clearInterval(pollInterval)
    console.error('Generation failed:', job.error)
  }
}, 2000) // Poll every 2 seconds
```

### Failure Path

```typescript
try {
  const response = await fetch('/api/generate', {
    method: 'POST',
    body: JSON.stringify({ projectId, inputAssetId, mode }),
  })
  
  if (response.status === 402) {
    const data = await response.json()
    if (data.code === 'NO_CREDITS') {
      // Show upgrade modal
      showUpgradeModal()
      return
    }
  }
  
  if (!response.ok) {
    throw new Error('Generation failed')
  }
  
  const { jobId } = await response.json()
  // ... continue with polling
  
} catch (error) {
  console.error('Generation error:', error)
  showErrorToast('Failed to start generation')
}
```

---

## Job Status Tracking

### Job States

| Status | Description | Final State? |
|--------|-------------|--------------|
| `queued` | Job created, waiting to start | No |
| `running` | Generation in progress | No |
| `succeeded` | Generation completed successfully | Yes ✅ |
| `failed` | Generation failed (error logged) | Yes ❌ |

### Polling Recommendations

- **Interval:** 2-5 seconds
- **Timeout:** 60 seconds (most generations complete in 10-30s)
- **Max Attempts:** 30 polls (60s / 2s)
- **Backoff:** Optional exponential backoff

```typescript
async function pollJobStatus(jobId: string, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`/api/jobs/${jobId}`)
    const job = await response.json()
    
    if (job.status === 'succeeded') {
      return { success: true, job }
    }
    
    if (job.status === 'failed') {
      return { success: false, error: job.error }
    }
    
    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  throw new Error('Job timed out after 60 seconds')
}
```

---

## Credit Management

### Credit Check

**Before Generation:**
- System checks if user has >= 1 credit
- If insufficient, returns 402 with `NO_CREDITS` code
- Generation does NOT proceed if credits are insufficient

**After Successful Generation:**
- System spends exactly 1 credit
- Credit ledger entry created with reason='generation'
- Credit spend references job ID for audit trail

**After Failed Generation:**
- Credits are NOT spent
- User is not charged for failed generations
- Can retry without losing credits

### Credit Spending Flow

```sql
-- Credit check (before generation)
SELECT has_sufficient_credits(user_id, 1)

-- If TRUE, proceed with generation
-- If FALSE, return 402 error

-- After successful generation
INSERT INTO credit_ledger (
  user_id,
  delta,
  reason,
  ref_type,
  ref_id
) VALUES (
  'user-uuid',
  -1,              -- Spend 1 credit
  'generation',
  'job',
  'job-uuid'
)
```

### Credit Balance Query

```typescript
import { getCreditBalance } from '@/lib/db/billing'

const balance = await getCreditBalance(userId)
console.log(`Credits remaining: ${balance}`)
```

---

## OpenAI Integration

### DALL-E 2 Configuration

**Model:** `dall-e-2`  
**Size:** `1024x1024`  
**Format:** `b64_json` (base64 encoding)  
**Cost:** $0.020 per image (2 cents)

### API Call

```typescript
const response = await openai.images.edit({
  model: 'dall-e-2',
  image: inputFile,        // File object with input image
  prompt: generatedPrompt,  // Amazon-compliant prompt
  n: 1,                     // Generate 1 image
  size: '1024x1024',       // 1024x1024 pixels
  response_format: 'b64_json', // Base64 response
})

const b64Image = response.data[0].b64_json
```

### Prompt Generation

Uses the prompt library (`lib/prompts.ts`) to generate Amazon-compliant prompts:

```typescript
import { buildPrompt } from '@/lib/prompts'

const { prompt, promptPayload } = buildPrompt(mode, {
  productCategory,
  brandTone,
  productDescription,
  constraints,
})

// prompt: Full prompt for OpenAI
// promptPayload: Audit trail stored in database
```

---

## Storage Management

### Input Assets

**Bucket:** `commercepix-inputs`  
**Path:** `{userId}/{projectId}/{assetId}.{ext}`  
**Access:** Signed URLs (temporary, 1 hour)

### Output Assets

**Bucket:** `commercepix-outputs`  
**Path:** `{userId}/{projectId}/{uniqueFilename}.png`  
**Format:** PNG (1024x1024)  
**Access:** Signed URLs (temporary, configurable)

### Storage Flow

```typescript
// 1. Fetch input image
const signedUrl = await getSignedUrl(
  BUCKETS.INPUTS,
  inputAsset.storage_path,
  3600 // 1 hour expiry
)

// 2. Download input image
const imageResponse = await fetch(signedUrl)
const imageBuffer = await imageResponse.arrayBuffer()

// 3. Generate with OpenAI
const outputImage = await openai.images.edit({ ... })

// 4. Upload output
const storagePath = `${userId}/${projectId}/${uniqueId}.png`
await uploadFile(
  BUCKETS.OUTPUTS,
  storagePath,
  imageBuffer
)
```

---

## Database Records

### Generation Jobs Table

```sql
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  input_asset_id UUID REFERENCES assets(id),
  mode TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  error TEXT,
  cost_cents INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Job Record:**
```json
{
  "id": "job-uuid",
  "user_id": "user-uuid",
  "project_id": "project-uuid",
  "input_asset_id": "input-uuid",
  "mode": "main_white",
  "status": "succeeded",
  "error": null,
  "cost_cents": 2,
  "created_at": "2026-01-05T12:00:00Z",
  "updated_at": "2026-01-05T12:00:15Z"
}
```

### Assets Table

```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  kind TEXT NOT NULL CHECK (kind IN ('input', 'output')),
  mode TEXT CHECK (mode IN ('main_white', 'lifestyle', 'feature_callout', 'packaging')),
  source_asset_id UUID REFERENCES assets(id),
  prompt_version TEXT,
  prompt_payload JSONB,
  width INT,
  height INT,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Output Asset Record:**
```json
{
  "id": "asset-uuid",
  "user_id": "user-uuid",
  "project_id": "project-uuid",
  "kind": "output",
  "mode": "main_white",
  "source_asset_id": "input-uuid",
  "prompt_version": "v1",
  "prompt_payload": {
    "mode": "main_white",
    "version": "v1",
    "inputs": { ... },
    "constraints": [ ... ],
    "template": "main_white_v1",
    "generatedAt": "2026-01-05T12:00:10Z"
  },
  "width": 1024,
  "height": 1024,
  "mime_type": "image/png",
  "storage_path": "user/project/unique.png",
  "created_at": "2026-01-05T12:00:15Z"
}
```

### Credit Ledger Table

```sql
CREATE TABLE credit_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  delta INT NOT NULL,
  reason TEXT NOT NULL,
  ref_type TEXT,
  ref_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

**Credit Spend Record:**
```json
{
  "id": "ledger-uuid",
  "user_id": "user-uuid",
  "delta": -1,
  "reason": "generation",
  "ref_type": "job",
  "ref_id": "job-uuid",
  "created_at": "2026-01-05T12:00:15Z"
}
```

---

## Error Handling

### Credit Spending Failures

If credit spending fails AFTER generation:
1. Generation is rolled back
2. Job is marked as 'failed'
3. Error is logged with details
4. User is notified of the failure

```typescript
// Credit spend with error handling
const creditResult = await spendCredits(userId, 1, 'generation', 'job', jobId)

if (!creditResult.success) {
  throw new Error(`Failed to spend credits: ${creditResult.error}`)
}
// Only mark job as succeeded if credits were spent
```

### OpenAI API Failures

**Common Errors:**
- Rate limit exceeded (429)
- Invalid API key (401)
- Content policy violation (400)
- Service unavailable (503)

**Handling:**
```typescript
try {
  const response = await openai.images.edit({ ... })
} catch (error) {
  // Mark job as failed
  await updateGenerationJob(jobId, {
    status: 'failed',
    error: error.message,
  })
  // Credits are NOT spent
}
```

### Storage Failures

**Upload Failure:**
```typescript
const uploadResult = await uploadFile(...)

if (uploadResult.error) {
  throw new Error('Failed to upload generated image to storage')
  // Job marked as failed
  // Credits NOT spent
}
```

---

## Rate Limiting

### Limits

| Limit | Value | Reset |
|-------|-------|-------|
| Per Minute | 10 requests | Rolling window |
| Per Day | 100 requests | Midnight UTC |

### Rate Limit Headers

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 5
X-RateLimit-Reset: 2026-01-05T12:05:00.000Z
Retry-After: 45
```

### Handling Rate Limits

```typescript
if (response.status === 429) {
  const data = await response.json()
  const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
  
  console.log(`Rate limited. Retry after ${retryAfter} seconds`)
  
  // Wait and retry
  await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
  // Retry request
}
```

---

## Best Practices

### 1. Check Credits Before Calling

```typescript
// Check credit balance first
const balance = await getCreditBalance(userId)

if (balance < 1) {
  showUpgradeModal()
  return
}

// Then call generate API
```

### 2. Handle 402 Gracefully

```typescript
if (response.status === 402) {
  const data = await response.json()
  
  if (data.code === 'NO_CREDITS') {
    showUpgradeModal({
      reason: 'no_credits',
      message: data.message,
    })
  }
}
```

### 3. Poll Status Efficiently

```typescript
// Use exponential backoff
let delay = 2000 // Start with 2s
const maxDelay = 10000 // Max 10s

async function pollWithBackoff(jobId) {
  while (true) {
    const job = await fetchJobStatus(jobId)
    
    if (job.status === 'succeeded' || job.status === 'failed') {
      return job
    }
    
    await sleep(delay)
    delay = Math.min(delay * 1.5, maxDelay)
  }
}
```

### 4. Provide User Feedback

```typescript
// Show loading state
setGenerating(true)

// Start generation
const { jobId } = await startGeneration()

// Show progress
showToast('Generating image...', { duration: Infinity })

// Poll status
const job = await pollJobStatus(jobId)

// Update UI
hideToast()
setGenerating(false)

if (job.status === 'succeeded') {
  showSuccessToast('Image generated!')
  refreshGallery()
} else {
  showErrorToast('Generation failed')
}
```

### 5. Handle Errors Gracefully

```typescript
try {
  const response = await fetch('/api/generate', { ... })
  
  // Check for specific error codes
  if (response.status === 402) {
    handleInsufficientCredits()
    return
  }
  
  if (response.status === 429) {
    handleRateLimit(response)
    return
  }
  
  if (!response.ok) {
    throw new Error('Generation failed')
  }
  
  // Success path
  const { jobId } = await response.json()
  await pollJobStatus(jobId)
  
} catch (error) {
  console.error('Generation error:', error)
  showErrorToast('An unexpected error occurred')
}
```

---

## Testing

### Manual Testing

```bash
# 1. Generate with valid inputs
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "projectId": "project-uuid",
    "inputAssetId": "asset-uuid",
    "mode": "main_white",
    "productCategory": "electronics",
    "productDescription": "wireless headphones"
  }'

# 2. Test insufficient credits
# (Set user credit balance to 0 first)
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "projectId": "project-uuid",
    "inputAssetId": "asset-uuid",
    "mode": "main_white"
  }'
# Should return 402

# 3. Test invalid mode
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "projectId": "project-uuid",
    "inputAssetId": "asset-uuid",
    "mode": "invalid_mode"
  }'
# Should return 400
```

### Integration Tests

```typescript
import { describe, it, expect } from '@jest/globals'

describe('Generate API', () => {
  it('should generate image successfully', async () => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        inputAssetId: testAssetId,
        mode: 'main_white',
      }),
    })
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.jobId).toBeDefined()
    expect(data.status).toBe('queued')
  })
  
  it('should return 402 when credits insufficient', async () => {
    // Set user credits to 0
    await setCreditBalance(testUserId, 0)
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        projectId: testProjectId,
        inputAssetId: testAssetId,
        mode: 'main_white',
      }),
    })
    
    expect(response.status).toBe(402)
    const data = await response.json()
    expect(data.code).toBe('NO_CREDITS')
  })
  
  it('should NOT spend credits on failure', async () => {
    // Mock OpenAI to fail
    mockOpenAIFailure()
    
    const initialBalance = await getCreditBalance(testUserId)
    
    const response = await fetch('/api/generate', { ... })
    const { jobId } = await response.json()
    
    // Wait for job to fail
    await pollJobUntilComplete(jobId)
    
    const finalBalance = await getCreditBalance(testUserId)
    expect(finalBalance).toBe(initialBalance) // No change
  })
})
```

---

## Troubleshooting

### Issue: "Insufficient credits" but user has credits

**Problem:** Credit balance not updated or cached incorrectly.

**Solution:**
```sql
-- Check actual credit balance
SELECT SUM(delta) as balance
FROM credit_ledger
WHERE user_id = 'user-uuid';

-- Refresh credit view
REFRESH MATERIALIZED VIEW user_credit_balance;
```

### Issue: Generation succeeds but credits not spent

**Problem:** Credit spending logic skipped or failed silently.

**Check:**
1. Look for error logs in job record
2. Check credit_ledger for missing entry
3. Verify spendCredits function is called

**Fix:**
```typescript
// Ensure credit spending is NOT wrapped in try-catch
// that silently fails
const creditResult = await spendCredits(...)
if (!creditResult.success) {
  throw new Error(creditResult.error) // This will fail the job
}
```

### Issue: Job stuck in 'queued' or 'running'

**Problem:** Background processing crashed or never started.

**Check:**
1. Server logs for processing errors
2. OpenAI API key configured
3. Storage permissions

**Recovery:**
```sql
-- Find stuck jobs (older than 5 minutes)
SELECT * FROM generation_jobs
WHERE status IN ('queued', 'running')
AND created_at < NOW() - INTERVAL '5 minutes';

-- Manually mark as failed
UPDATE generation_jobs
SET status = 'failed', error = 'Timeout'
WHERE id = 'stuck-job-uuid';
```

### Issue: "Failed to upload generated image"

**Problem:** Storage permissions or bucket configuration.

**Check:**
1. Bucket exists (`commercepix-outputs`)
2. RLS policies allow insert
3. User authenticated correctly

**Fix:**
```sql
-- Check bucket policy
SELECT * FROM storage.buckets
WHERE name = 'commercepix-outputs';

-- Verify RLS policy
SELECT * FROM storage.policies
WHERE bucket_id = 'commercepix-outputs';
```

---

## Conclusion

The Generate API provides:

- ✅ **Complete Generation Workflow** - End-to-end AI image generation
- ✅ **Credit Management** - Check before, spend after, rollback on failure
- ✅ **Job Tracking** - Async processing with status polling
- ✅ **Error Handling** - Graceful failures with no credit loss
- ✅ **Rate Limiting** - Protect against abuse
- ✅ **OpenAI Integration** - DALL-E 2 image editing
- ✅ **Storage Management** - Input/output handling
- ✅ **Audit Trail** - Complete prompt and credit logging
- ✅ **Amazon Compliance** - Marketplace-ready prompts

Use this endpoint to generate professional product images for e-commerce listings.

---

**For support or questions:** See [Prompt Library](./PROMPT_LIBRARY.md) for prompt details or [Upload API](./UPLOAD_API.md) for asset management.

