# Upload API Documentation

Complete guide for uploading product photos to CommercePix.

## Overview

CommercePix provides two upload endpoints for different use cases:

1. **`POST /api/upload`** - Simple upload for product photos (recommended)
2. **`POST /api/assets/upload`** - Advanced upload with mode and prompt data

Both endpoints handle file validation, storage upload, and database record creation.

## Simple Upload Endpoint

### `POST /api/upload`

Recommended for general use. Uploads a product photo to the inputs bucket.

#### Request

**Content-Type:** `multipart/form-data`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | ✅ Yes | Image file (JPG, PNG, WebP) |
| `projectId` | string | ✅ Yes | Project UUID to associate asset with |

#### Validation Rules

- **File Types:** JPG, PNG, WebP only
- **Max Size:** 10MB
- **Min Size:** > 0 bytes (not empty)
- **Authentication:** Required (user session)

#### Response

**Success (200):**

```json
{
  "assetId": "550e8400-e29b-41d4-a716-446655440000",
  "projectId": "660e8400-e29b-41d4-a716-446655440000",
  "storagePath": "user-id/project-id/asset-id.jpg",
  "message": "File uploaded successfully"
}
```

**Error (400 - Validation):**

```json
{
  "error": "File too large",
  "message": "File size must be less than 10MB",
  "maxSize": 10485760,
  "actualSize": 15728640
}
```

**Error (401 - Unauthorized):**

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

**Error (500 - Server Error):**

```json
{
  "error": "Upload failed",
  "message": "Failed to upload file to storage"
}
```

#### Example Usage

**JavaScript/TypeScript:**

```typescript
async function uploadProductPhoto(file: File, projectId: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Upload failed')
  }

  const data = await response.json()
  return data // { assetId, projectId, storagePath }
}

// Usage
try {
  const result = await uploadProductPhoto(file, projectId)
  console.log('Uploaded:', result.assetId)
} catch (error) {
  console.error('Upload error:', error)
}
```

**cURL:**

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/product.jpg" \
  -F "projectId=your-project-uuid" \
  -H "Cookie: your-session-cookie"
```

**React Component:**

```tsx
import { useState } from 'react'
import { toast } from 'sonner'

function UploadWidget({ projectId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Image uploaded!')
        onUploadComplete(data.assetId)
      } else {
        toast.error('Upload failed', {
          description: data.message
        })
      }
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={handleFileSelect}
      disabled={uploading}
    />
  )
}
```

## Configuration Endpoint

### `GET /api/upload`

Returns upload configuration and limits.

#### Response

```json
{
  "maxFileSize": 10485760,
  "maxFileSizeMB": 10,
  "allowedMimeTypes": [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/jpg"
  ],
  "allowedExtensions": ["jpg", "jpeg", "png", "webp"]
}
```

#### Example Usage

```typescript
async function getUploadConfig() {
  const response = await fetch('/api/upload')
  const config = await response.json()
  return config
}

// Display max file size to user
const config = await getUploadConfig()
console.log(`Max file size: ${config.maxFileSizeMB}MB`)
```

## Advanced Upload Endpoint

### `POST /api/assets/upload`

Advanced endpoint with additional parameters for mode and prompt data.

#### Request

**Content-Type:** `multipart/form-data`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | ✅ Yes | Image file (JPG, PNG, WebP) |
| `projectId` | string | ✅ Yes | Project UUID |
| `mode` | string | ❌ No | Generation mode (default: main_white) |
| `promptVersion` | string | ❌ No | Prompt version (default: v1) |
| `promptPayload` | string | ❌ No | JSON string with prompt data |

**Valid Modes:**
- `main_white` - Main image with white background
- `lifestyle` - Lifestyle scene
- `feature_callout` - Feature highlights
- `packaging` - Packaging/in-box shot

#### Response

```json
{
  "assetId": "550e8400-e29b-41d4-a716-446655440000",
  "projectId": "660e8400-e29b-41d4-a716-446655440000"
}
```

#### Example Usage

```typescript
async function uploadWithMode(
  file: File,
  projectId: string,
  mode: string = 'main_white'
) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)
  formData.append('mode', mode)
  formData.append('promptVersion', 'v1')
  formData.append('promptPayload', JSON.stringify({
    category: 'electronics',
    brandTone: 'professional'
  }))

  const response = await fetch('/api/assets/upload', {
    method: 'POST',
    body: formData,
  })

  return await response.json()
}
```

## Storage Structure

### Bucket: `commercepix-inputs`

All uploaded product photos are stored in the inputs bucket.

**Path Structure:**
```
commercepix-inputs/
  └── {userId}/
      └── {projectId}/
          └── {assetId}.{ext}
```

**Example:**
```
commercepix-inputs/
  └── 123e4567-e89b-12d3-a456-426614174000/
      └── 789e4567-e89b-12d3-a456-426614174000/
          └── 550e8400-e29b-41d4-a716-446655440000.jpg
```

### File Naming

- **Extension:** Determined from MIME type
  - `image/jpeg` → `.jpg`
  - `image/png` → `.png`
  - `image/webp` → `.webp`
- **Unique ID:** UUID v4 for asset ID
- **No Conflicts:** UUID ensures uniqueness

## Database Record

### Table: `assets`

Every uploaded file creates a record in the `assets` table.

**Schema:**

```sql
CREATE TABLE assets (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  kind text CHECK (kind IN ('input', 'output')),
  mode text CHECK (mode IN ('main_white', 'lifestyle', 'feature_callout', 'packaging')),
  storage_path text NOT NULL,
  mime_type text NOT NULL,
  width int,
  height int,
  source_asset_id uuid REFERENCES assets(id),
  prompt_version text,
  prompt_payload jsonb,
  created_at timestamptz DEFAULT now()
);
```

**For Uploaded Files:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "project_id": "789e4567-e89b-12d3-a456-426614174000",
  "kind": "input",
  "mode": null,
  "storage_path": "user-id/project-id/asset-id.jpg",
  "mime_type": "image/jpeg",
  "width": null,
  "height": null,
  "source_asset_id": null,
  "prompt_version": null,
  "prompt_payload": null,
  "created_at": "2026-01-05T12:00:00Z"
}
```

## Error Codes

### 400 Bad Request

**Reasons:**
- Missing required parameters
- Invalid file type
- File too large
- Empty file
- Invalid JSON in promptPayload

**Example:**
```json
{
  "error": "Invalid file type",
  "message": "Only JPG, PNG, and WebP images are allowed",
  "allowedTypes": ["image/jpeg", "image/png", "image/webp"]
}
```

### 401 Unauthorized

**Reason:** User not authenticated

**Example:**
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 500 Internal Server Error

**Reasons:**
- Storage upload failure
- Database insertion failure
- Unexpected server error

**Example:**
```json
{
  "error": "Upload failed",
  "message": "Failed to create asset record"
}
```

## Security

### Authentication

All upload endpoints require user authentication:

```typescript
const user = await requireUser()
```

- Session-based authentication via Supabase
- Redirects to `/auth` if not authenticated
- User ID automatically associated with asset

### Authorization

- Users can only upload to their own projects
- RLS (Row Level Security) enforces ownership
- Asset records tied to user_id

### Validation

- **File Type:** MIME type whitelist
- **File Size:** 10MB hard limit
- **Empty Files:** Rejected (0 bytes)
- **Malicious Files:** MIME type check prevents most attacks

### Storage Security

- **Private Buckets:** Not publicly accessible
- **Signed URLs:** Temporary access via API
- **User Isolation:** Files organized by user ID
- **RLS Policies:** Database-level security

## Best Practices

### Client-Side

1. **Validate Before Upload:**
```typescript
function validateFile(file: File): string | null {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return 'Please select a JPG, PNG, or WebP image'
  }
  if (file.size > 10 * 1024 * 1024) {
    return 'File must be less than 10MB'
  }
  if (file.size === 0) {
    return 'File is empty'
  }
  return null
}
```

2. **Show Progress:**
```typescript
const xhr = new XMLHttpRequest()
xhr.upload.addEventListener('progress', (e) => {
  const percent = (e.loaded / e.total) * 100
  console.log(`Upload: ${percent}%`)
})
```

3. **Handle Errors:**
```typescript
try {
  const result = await uploadFile(file, projectId)
} catch (error) {
  if (error.message.includes('too large')) {
    toast.error('File too large - please use an image under 10MB')
  } else {
    toast.error('Upload failed - please try again')
  }
}
```

### Server-Side

1. **Use Existing Endpoints:** Don't create custom upload logic
2. **Check Response:** Always verify `response.ok` before parsing JSON
3. **Log Errors:** Console log errors for debugging
4. **Clean Up:** Consider cleanup jobs for failed uploads

## Testing

### Manual Testing

```bash
# Upload a file
curl -X POST http://localhost:3000/api/upload \
  -F "file=@test-image.jpg" \
  -F "projectId=your-project-uuid"

# Check configuration
curl http://localhost:3000/api/upload
```

### Automated Testing

```typescript
import { describe, it, expect } from '@jest/globals'

describe('Upload API', () => {
  it('should upload a valid image', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', 'test-project-id')

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.assetId).toBeDefined()
    expect(data.projectId).toBe('test-project-id')
  })

  it('should reject files over 10MB', async () => {
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg'
    })
    // ... test logic
  })
})
```

## Troubleshooting

### "File too large" Error

**Problem:** File exceeds 10MB limit

**Solutions:**
- Compress image before upload
- Use image optimization tools (TinyPNG, ImageOptim)
- Resize image to smaller dimensions

### "Invalid file type" Error

**Problem:** Unsupported file format

**Solutions:**
- Convert to JPG, PNG, or WebP
- Check file extension matches content
- Ensure file is actually an image

### "Project ID is required" Error

**Problem:** Missing projectId parameter

**Solution:**
```typescript
// Make sure to include projectId
formData.append('projectId', projectId)
```

### Upload Succeeds but Asset Not Created

**Problem:** Database insertion failure

**Check:**
- Project exists and user has access
- Database connection is working
- RLS policies allow insertion
- Check server logs for errors

## Migration Guide

### From Old Upload Pattern

**Before:**
```typescript
// Manual fetch with no validation
const response = await fetch('/some-custom-endpoint', {
  method: 'POST',
  body: formData
})
```

**After:**
```typescript
// Use standardized endpoint with validation
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})
const data = await response.json()
console.log('Asset ID:', data.assetId)
```

## Conclusion

The Upload API provides:

- ✅ **Simple Integration** - One endpoint, clear parameters
- ✅ **Robust Validation** - Type and size checking
- ✅ **Secure Storage** - Supabase with RLS
- ✅ **Database Integration** - Automatic record creation
- ✅ **Error Handling** - Clear error messages
- ✅ **Production-Ready** - Used in live workspace

Use `/api/upload` for all product photo uploads in your application.

