# Upload Endpoint Specification

## POST /api/assets/upload

Upload an input image asset to Commerce PIX.

### Request

**Content-Type:** `multipart/form-data`

**Required Fields:**
- `file`: File - Image file (jpg/png/webp only)
- `projectId`: string - UUID of the project

**Optional Fields:**
- `mode`: string - One of: `main_white` (default), `lifestyle`, `feature_callout`, `packaging`
- `promptVersion`: string - Version identifier (default: `v1`)
- `promptPayload`: string - JSON stringified object (default: `{}`)

### Validation Rules

**File Type:**
- ✅ `image/jpeg` (jpg)
- ✅ `image/png` (png)
- ✅ `image/webp` (webp)
- ❌ All other types rejected

**File Size:**
- Maximum: **8MB**
- Files larger than 8MB will be rejected

**Mode:**
- Must be one of: `main_white`, `lifestyle`, `feature_callout`, `packaging`
- Defaults to `main_white` if not provided

### Response

**Success (200):**
```json
{
  "assetId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error (400):**
```json
{
  "error": "File must be jpg, png, or webp"
}
```

**Error (401):**
```json
{
  "error": "Unauthorized"
}
```

### Error Messages

| Error | Description |
|-------|-------------|
| `File is required` | No file provided in request |
| `Project ID is required` | No projectId provided |
| `Mode must be one of: ...` | Invalid mode value |
| `Invalid prompt payload JSON` | promptPayload is not valid JSON |
| `File must be jpg, png, or webp` | Invalid file type |
| `File size must be less than 8MB` | File too large |
| `Failed to upload file to storage` | Storage upload failed |

### Storage Behavior

**Bucket:** `commercepix-inputs` (private)

**Path Format:** `{userId}/{projectId}/{assetId}.{extension}`

Example: `550e8400.../123e4567.../abc12345.../image.jpg`

### Database Record

Creates an `assets` table row with:
- `id`: Generated UUID (returned as `assetId`)
- `user_id`: Current authenticated user
- `project_id`: From request
- `kind`: Always `'input'`
- `mode`: From request or `'main_white'` (default)
- `storage_path`: Generated path
- `prompt_version`: From request or `'v1'`
- `prompt_payload`: From request or `{}`
- `mime_type`: File's MIME type
- `width`: null (populated later if needed)
- `height`: null (populated later if needed)
- `created_at`: Auto-generated timestamp

### Usage Examples

#### JavaScript/TypeScript

```typescript
const formData = new FormData()
formData.append('file', imageFile) // File object from input
formData.append('projectId', projectId)
formData.append('mode', 'main_white') // Optional

const response = await fetch('/api/assets/upload', {
  method: 'POST',
  body: formData
})

const { assetId } = await response.json()
console.log('Uploaded asset:', assetId)

// Get signed URL for viewing
const urlResponse = await fetch(`/api/assets/${assetId}/signed-url`)
const { signedUrl } = await urlResponse.json()
```

#### cURL

```bash
curl -X POST http://localhost:3001/api/assets/upload \
  -H "Cookie: your-session-cookie" \
  -F "file=@product-photo.jpg" \
  -F "projectId=123e4567-e89b-12d3-a456-426614174000" \
  -F "mode=lifestyle"
```

#### React Component

```tsx
function ImageUploader({ projectId }: { projectId: string }) {
  const [file, setFile] = useState<File | null>(null)
  const [assetId, setAssetId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)

    try {
      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const { error } = await response.json()
        setError(error)
        return
      }

      const { assetId } = await response.json()
      setAssetId(assetId)
    } catch (err) {
      setError('Upload failed')
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
      {assetId && <p>Asset ID: {assetId}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  )
}
```

### Security

**Authentication:**
- User must be authenticated (session cookie)
- Uses `requireUser()` helper
- Redirects to `/auth/login` if not authenticated

**Authorization:**
- No explicit ownership check on upload
- User can upload to any project
- Consider adding project ownership verification:
  ```typescript
  const project = await getProject(projectId)
  if (project.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  ```

**Storage Isolation:**
- Files stored in user's folder (`userId/...`)
- Private bucket (signed URLs required)
- Row Level Security on database

### Performance Considerations

**File Size:**
- 8MB limit balances quality vs upload time
- Typical product photos: 500KB - 2MB
- Consider client-side compression for larger files

**Upload Time:**
- ~1-3 seconds for typical 1-2MB image
- Network dependent
- Show progress indicator to user

**Storage Costs:**
- Supabase Storage: Free tier includes 1GB
- Approximately 500-2000 images per GB (depending on size)

### Testing

**Test Page:** http://localhost:3001/api-test

**Test Cases:**
1. ✅ Valid JPG upload (< 8MB)
2. ✅ Valid PNG upload (< 8MB)
3. ✅ Valid WebP upload (< 8MB)
4. ❌ Invalid file type (e.g., GIF, PDF)
5. ❌ File > 8MB
6. ❌ No file provided
7. ❌ No project ID
8. ❌ Invalid mode
9. ❌ Unauthenticated request

### Integration Workflow

```typescript
// 1. User selects image
const file = inputElement.files[0]

// 2. Optional: Validate on client side
if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
  alert('Invalid file type')
  return
}

if (file.size > 8 * 1024 * 1024) {
  alert('File too large')
  return
}

// 3. Upload to API
const formData = new FormData()
formData.append('file', file)
formData.append('projectId', projectId)
formData.append('mode', mode)

const { assetId } = await fetch('/api/assets/upload', {
  method: 'POST',
  body: formData
}).then(r => r.json())

// 4. Use assetId for generation
await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inputAssetId: assetId,
    mode: mode
  })
})
```

### Troubleshooting

**Issue:** "File must be jpg, png, or webp"
- **Solution:** Check file MIME type, ensure it's one of the allowed types

**Issue:** "File size must be less than 8MB"
- **Solution:** Compress image before upload or use client-side resizing

**Issue:** "Failed to upload file to storage"
- **Solution:** Check Supabase storage bucket exists and is configured correctly

**Issue:** Upload succeeds but can't view image
- **Solution:** Use `/api/assets/[id]/signed-url` to get temporary URL

**Issue:** Slow uploads
- **Solution:** Compress images, check network speed, consider showing progress

---

**Status:** ✅ Implemented | ✅ Tested | ✅ Documented

