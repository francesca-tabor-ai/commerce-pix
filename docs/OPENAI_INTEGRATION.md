# OpenAI Image Transformation Implementation

## Overview

The `/api/generate` endpoint now supports **image transformation** using OpenAI's DALL-E 2 image editing capabilities. This allows uploaded product images to be transformed into different styles (main_white, lifestyle, feature_callout, packaging) using structured prompts.

## Key Changes

### From DALL-E 3 (Text-to-Image) → DALL-E 2 (Image Editing)

**Before**: Only supported text-to-image generation
**After**: Supports image + prompt transformation

## Implementation Details

### API Endpoint: `POST /api/generate`

#### Request

```typescript
{
  "inputAssetId": "uuid",              // Required: ID of uploaded input image
  "mode": "main_white",                // Required: Generation mode
  "productDescription": "headphones",  // Optional: Product description
  "productCategory": "electronics",    // Optional: Product category
  "brandTone": "professional",         // Optional: Brand tone
  "constraints": [],                   // Optional: Additional constraints
  "promptVersion": "v1"                // Optional: Prompt version (default: v1)
}
```

#### Process Flow

```
1. Create generation_jobs row
   ├─ status: 'queued'
   ├─ user_id: (from auth)
   ├─ project_id: (from input asset)
   └─ input_asset_id: (provided)

2. Update status to 'running'

3. Fetch input image from storage
   ├─ Get signed URL from commercepix-inputs
   ├─ Download image buffer
   └─ Convert to File object

4. Build prompt using prompt library
   ├─ Use structured inputs
   ├─ Apply Amazon compliance rules
   └─ Generate prompt_payload for audit

5. Call OpenAI DALL-E 2 Image Edit API
   ├─ model: 'dall-e-2'
   ├─ image: (input file)
   ├─ prompt: (generated from library)
   ├─ size: '1024x1024'
   └─ response_format: 'b64_json'

6. Receive base64 image response
   └─ Convert to buffer

7. Upload output to commercepix-outputs
   ├─ path: {userId}/{projectId}/{outputAssetId}.png
   ├─ contentType: 'image/png'
   └─ cacheControl: '3600'

8. Create assets row
   ├─ kind: 'output'
   ├─ mode: (selected mode)
   ├─ source_asset_id: (input asset ID)
   ├─ prompt_version: 'v1'
   ├─ prompt_payload: (full audit object)
   ├─ width: 1024
   ├─ height: 1024
   ├─ mime_type: 'image/png'
   └─ storage_path: (output path)

9. Update generation_jobs
   ├─ status: 'succeeded'
   └─ cost_cents: 2 (DALL-E 2 edit: $0.02/image)

OR (on error)

9. Update generation_jobs
   ├─ status: 'failed'
   └─ error: (error message)
```

#### Response

```typescript
{
  "job": {
    "id": "uuid",
    "user_id": "uuid",
    "project_id": "uuid",
    "status": "queued",
    "mode": "main_white",
    "input_asset_id": "uuid",
    "cost_cents": 0,
    "created_at": "2026-01-04T23:45:00Z",
    "updated_at": "2026-01-04T23:45:00Z"
  },
  "message": "Generation job created and processing"
}
```

## Database Records

### generation_jobs Table

**Created at start**:
```sql
INSERT INTO generation_jobs (
  user_id,
  project_id,
  status,
  mode,
  input_asset_id,
  cost_cents
) VALUES (
  'user-uuid',
  'project-uuid',
  'queued',
  'main_white',
  'input-asset-uuid',
  0
);
```

**Updated during processing**:
```sql
-- When starting
UPDATE generation_jobs 
SET status = 'running', updated_at = NOW()
WHERE id = 'job-uuid';

-- On success
UPDATE generation_jobs 
SET 
  status = 'succeeded', 
  cost_cents = 2,
  updated_at = NOW()
WHERE id = 'job-uuid';

-- On failure
UPDATE generation_jobs 
SET 
  status = 'failed', 
  error = 'Error message',
  updated_at = NOW()
WHERE id = 'job-uuid';
```

### assets Table

**Output asset created on success**:
```sql
INSERT INTO assets (
  user_id,
  project_id,
  kind,
  mode,
  source_asset_id,
  prompt_version,
  prompt_payload,
  width,
  height,
  mime_type,
  storage_path
) VALUES (
  'user-uuid',
  'project-uuid',
  'output',
  'main_white',
  'input-asset-uuid',
  'v1',
  '{
    "mode": "main_white",
    "version": "v1",
    "inputs": {
      "productDescription": "wireless headphones",
      "productCategory": "electronics",
      "brandTone": "professional"
    },
    "constraints": [...],
    "template": "main_white_v1",
    "generatedAt": "2026-01-04T23:45:00.000Z"
  }',
  1024,
  1024,
  'image/png',
  'user-uuid/project-uuid/output-uuid.png'
);
```

## OpenAI API Details

### DALL-E 2 Image Edit API

**Endpoint**: `images.edit`

**Model**: `dall-e-2` (DALL-E 3 doesn't support image editing)

**Parameters**:
- `image`: File object (input image)
- `prompt`: String (generated from prompt library)
- `n`: 1 (number of images)
- `size`: '1024x1024'
- `response_format`: 'b64_json' (base64 to avoid extra download)

**Cost**: $0.020 per image (2 cents)

**Size Options**:
- `256x256`
- `512x512`
- `1024x1024` ← Current implementation

### Image Format Requirements

**Input**:
- Must be valid PNG image
- Must be square (for best results)
- Must be < 4MB
- Must have transparency (alpha channel) - OR -
- Will be converted to have transparency

**Output**:
- PNG format
- 1024x1024 pixels
- Base64 encoded (then converted to buffer)

## Error Handling

### Common Errors

**1. OpenAI API Key Not Configured**
```json
{
  "error": "OpenAI API key not configured",
  "status": 500
}
```

**2. Input Asset Not Found**
```json
{
  "error": "Input asset not found",
  "status": 404
}
```

**3. Unauthorized (Not Asset Owner)**
```json
{
  "error": "Unauthorized",
  "status": 403
}
```

**4. Invalid Mode**
```json
{
  "error": "Mode must be one of: main_white, lifestyle, feature_callout, packaging",
  "status": 400
}
```

**5. OpenAI API Error**
- Job status updated to 'failed'
- Error message stored in generation_jobs.error
- Examples:
  - "Invalid image format"
  - "Image too large"
  - "Rate limit exceeded"
  - "Insufficient quota"

## Testing Workflow

### 1. Upload Input Image

```bash
POST /api/assets/upload
Content-Type: multipart/form-data

file: (image file)
projectId: "project-uuid"
mode: "main_white"
```

**Response**:
```json
{
  "assetId": "input-asset-uuid"
}
```

### 2. Trigger Generation

```bash
POST /api/generate
Content-Type: application/json

{
  "inputAssetId": "input-asset-uuid",
  "mode": "lifestyle",
  "productDescription": "wireless headphones",
  "productCategory": "electronics",
  "brandTone": "professional"
}
```

**Response**:
```json
{
  "job": {
    "id": "job-uuid",
    "status": "queued",
    ...
  },
  "message": "Generation job created and processing"
}
```

### 3. Monitor Job Status

```bash
# Poll generation_jobs table or use /jobs-test UI
SELECT * FROM generation_jobs WHERE id = 'job-uuid';
```

**Status progression**:
- `queued` → `running` → `succeeded` or `failed`

### 4. Fetch Output Image

```bash
GET /api/assets/[output-asset-id]/signed-url
```

**Response**:
```json
{
  "signedUrl": "https://...supabase.co/storage/v1/object/sign/...",
  "expiresIn": 3600
}
```

## Browser Testing

### Test Page: `/api-test`

1. **Navigate** to `http://localhost:3001/api-test`
2. **Login** with your test account
3. **Select** a project
4. **Upload** an input image (jpg/png/webp, max 8MB)
5. **Fill** generation form:
   - Input Asset: (select uploaded asset)
   - Mode: (main_white, lifestyle, feature_callout, packaging)
   - Product Description: "wireless headphones"
   - Product Category: "electronics"
   - Brand Tone: "professional"
6. **Click** "Generate"
7. **Monitor** job status (check console logs)
8. **View** generated output (use "Get Signed URL" button)

### Expected Console Logs

```
Generating image for job {job-uuid} with mode: lifestyle
Prompt: Create a lifestyle product photography image...
Downloading input image from storage...
Calling OpenAI DALL-E 2 image edit API...
Received generated image from OpenAI
Generation job {job-uuid} completed successfully. Output asset: {output-uuid}
```

### Error Logs

If generation fails:
```
Generation job {job-uuid} failed: {error-message}
```

Check `generation_jobs.error` column for details.

## Cost Tracking

### Per Generation

- **DALL-E 2 Edit**: $0.020 per image (2 cents)
- Stored in `generation_jobs.cost_cents`: `2`

### Project Totals

```sql
SELECT 
  project_id,
  COUNT(*) as total_generations,
  SUM(cost_cents) as total_cost_cents,
  SUM(cost_cents) / 100.0 as total_cost_dollars
FROM generation_jobs
WHERE status = 'succeeded'
GROUP BY project_id;
```

### User Totals

```sql
SELECT 
  user_id,
  COUNT(*) as total_generations,
  SUM(cost_cents) as total_cost_cents,
  SUM(cost_cents) / 100.0 as total_cost_dollars
FROM generation_jobs
WHERE status = 'succeeded'
GROUP BY user_id;
```

## Code Example

### Complete Flow

```typescript
import { buildPrompt } from '@/lib/prompts'
import { getAsset, createAsset } from '@/lib/db/assets'
import { createGenerationJob, updateGenerationJob } from '@/lib/db/generation-jobs'
import { uploadFile, getSignedUrl, BUCKETS } from '@/lib/storage/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

async function transformImage(
  inputAssetId: string,
  mode: string,
  promptInputs: PromptInputs,
  userId: string
) {
  // 1. Create job
  const job = await createGenerationJob({
    project_id: inputAsset.project_id,
    mode,
    input_asset_id: inputAssetId,
  })
  
  // 2. Update to running
  await updateGenerationJob(job.id, { status: 'running' })
  
  // 3. Fetch input image
  const inputImageUrl = await getSignedUrl(BUCKETS.INPUTS, inputAsset.storage_path, 3600)
  const inputImageBuffer = await fetch(inputImageUrl.data.signedUrl).then(r => r.arrayBuffer())
  const inputFile = new File([inputImageBuffer], 'input.png', { type: 'image/png' })
  
  // 4. Build prompt
  const { prompt, promptPayload } = buildPrompt(mode, promptInputs)
  
  // 5. Call OpenAI
  const response = await openai.images.edit({
    model: 'dall-e-2',
    image: inputFile,
    prompt,
    size: '1024x1024',
    response_format: 'b64_json',
  })
  
  // 6. Convert base64 to buffer
  const imageBuffer = Buffer.from(response.data[0].b64_json, 'base64')
  
  // 7. Upload output
  const storagePath = `${userId}/${projectId}/${outputAssetId}.png`
  await uploadFile(BUCKETS.OUTPUTS, storagePath, imageBuffer, { contentType: 'image/png' })
  
  // 8. Create asset
  await createAsset({
    project_id: inputAsset.project_id,
    kind: 'output',
    mode,
    source_asset_id: inputAssetId,
    prompt_version: 'v1',
    prompt_payload: promptPayload,
    width: 1024,
    height: 1024,
    mime_type: 'image/png',
    storage_path: storagePath,
  })
  
  // 9. Update job
  await updateGenerationJob(job.id, { status: 'succeeded', cost_cents: 2 })
}
```

## Security

### Authentication

- All requests require valid Supabase auth token
- `requireUser()` checks authentication and returns user object
- RLS policies ensure users can only access their own data

### Validation

- Input asset ownership verified before generation
- Mode validated against allowed values
- Structured inputs prevent prompt injection

### Storage

- Input images stored in private `commercepix-inputs` bucket
- Output images stored in private `commercepix-outputs` bucket
- Signed URLs expire after 1 hour
- RLS policies enforce user_id matching

## Limitations

### DALL-E 2 vs DALL-E 3

| Feature | DALL-E 2 | DALL-E 3 |
|---------|----------|----------|
| Image Editing | ✅ Yes | ❌ No |
| Text-to-Image | ✅ Yes | ✅ Yes |
| Max Resolution | 1024x1024 | 1024x1792 |
| Quality | Standard | Standard, HD |
| Cost (Edit) | $0.020 | N/A |
| Cost (Generate) | $0.020 | $0.040-$0.080 |

### Current Implementation

- Uses DALL-E 2 for image transformation
- Fixed size: 1024x1024
- Single image per request (n=1)
- Synchronous processing (not background queue)

## Future Enhancements

### 1. Background Job Queue

Move processing to background queue (e.g., Redis, BullMQ):
- Immediate response to client
- Better error recovery
- Rate limiting
- Priority queuing

### 2. Multiple Sizes

Support different output sizes:
- 256x256 (thumbnails)
- 512x512 (previews)
- 1024x1024 (full size)

### 3. Batch Processing

Generate multiple variations in one request:
- Different modes from same input
- Different prompt parameters
- Cost optimization

### 4. Image Masking

Use DALL-E 2's mask parameter for targeted edits:
- Replace background only
- Edit specific product area
- Preserve certain regions

### 5. Progress Updates

Real-time progress via WebSocket or Server-Sent Events:
- Job queued
- Job started
- Job progress (if multi-step)
- Job completed

## Related Documentation

- [Prompt Library](./PROMPT_LIBRARY.md) - Structured prompt templates
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Storage Implementation](./STORAGE_IMPLEMENTATION.md) - File upload and signed URLs
- [Database Schema](./DATABASE_SCHEMA.md) - Database tables and RLS policies

## Troubleshooting

### Issue: "OpenAI API key not configured"

**Solution**: Set `OPENAI_API_KEY` in `.env.local`

```bash
OPENAI_API_KEY=sk-...
```

### Issue: "Invalid image format"

**Solution**: Ensure input image is valid PNG/JPEG and < 4MB

### Issue: Job stuck in 'running' status

**Solution**: Check server logs for errors, manually update job status

```sql
UPDATE generation_jobs 
SET status = 'failed', error = 'Timeout' 
WHERE id = 'job-uuid';
```

### Issue: "Rate limit exceeded"

**Solution**: OpenAI has rate limits. Wait and retry, or upgrade plan.

### Issue: Output image not displaying

**Solution**: Generate new signed URL (they expire after 1 hour)

```bash
GET /api/assets/[asset-id]/signed-url
```

---

**Status**: ✅ Implemented and tested  
**Last Updated**: 2026-01-04  
**Version**: 1.0

