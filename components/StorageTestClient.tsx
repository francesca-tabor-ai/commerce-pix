'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type BucketName = 'commercepix-inputs' | 'commercepix-outputs'

interface UploadResult {
  success: boolean
  message: string
  path?: string
  signedUrl?: string
}

export default function StorageTestClient({ userId }: { userId: string }) {
  const [selectedBucket, setSelectedBucket] = useState<BucketName>('commercepix-inputs')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  
  // Signed URL generation
  const [urlPath, setUrlPath] = useState('')
  const [generatingUrl, setGeneratingUrl] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  
  // File deletion
  const [deletePath, setDeletePath] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteResult, setDeleteResult] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadResult({ success: false, message: 'Please select a file first' })
      return
    }

    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', selectedBucket)
      formData.append('userId', userId)

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadResult({
          success: true,
          message: 'File uploaded successfully!',
          path: data.path,
          signedUrl: data.signedUrl,
        })
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setUploadResult({
          success: false,
          message: data.error || 'Upload failed',
        })
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: error instanceof Error ? error.message : 'Upload failed',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleGenerateSignedUrl = async () => {
    if (!urlPath.trim()) {
      setSignedUrl(null)
      return
    }

    setGeneratingUrl(true)
    setSignedUrl(null)

    try {
      const response = await fetch('/api/storage/signed-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: selectedBucket,
          path: urlPath,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSignedUrl(data.signedUrl)
      } else {
        setSignedUrl(`Error: ${data.error}`)
      }
    } catch (error) {
      setSignedUrl(`Error: ${error instanceof Error ? error.message : 'Failed to generate URL'}`)
    } finally {
      setGeneratingUrl(false)
    }
  }

  const handleDelete = async () => {
    if (!deletePath.trim()) {
      setDeleteResult('Please enter a file path')
      return
    }

    setDeleting(true)
    setDeleteResult(null)

    try {
      const response = await fetch('/api/storage/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: selectedBucket,
          path: deletePath,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setDeleteResult('✅ File deleted successfully')
        setDeletePath('')
      } else {
        setDeleteResult(`❌ ${data.error}`)
      }
    } catch (error) {
      setDeleteResult(`❌ ${error instanceof Error ? error.message : 'Failed to delete'}`)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Bucket Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Bucket</CardTitle>
          <CardDescription>Select which bucket to work with</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedBucket} onValueChange={(value) => setSelectedBucket(value as BucketName)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="commercepix-inputs">commercepix-inputs (for input images)</SelectItem>
              <SelectItem value="commercepix-outputs">commercepix-outputs (for generated outputs)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Upload a file to the selected bucket. Files will be stored in: {selectedBucket}/{userId}/...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-input">Select File</Label>
            <Input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              disabled={uploading}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <Button onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>

          {uploadResult && (
            <div
              className={`p-4 rounded-md ${
                uploadResult.success ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'
              }`}
            >
              <p className="font-medium">{uploadResult.message}</p>
              {uploadResult.path && (
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <strong>Storage Path:</strong> {uploadResult.path}
                  </p>
                  {uploadResult.signedUrl && (
                    <>
                      <p>
                        <strong>Signed URL (1 hour):</strong>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          readOnly
                          value={uploadResult.signedUrl}
                          className="font-mono text-xs"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(uploadResult.signedUrl!)}
                        >
                          Copy
                        </Button>
                      </div>
                      <div className="mt-2">
                        <img
                          src={uploadResult.signedUrl}
                          alt="Uploaded file"
                          className="max-w-sm rounded border"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Signed URL */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Signed URL</CardTitle>
          <CardDescription>
            Generate a temporary signed URL for a file (1 hour expiry)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url-path">File Path</Label>
            <Input
              id="url-path"
              placeholder={`${userId}/project-id/filename.jpg`}
              value={urlPath}
              onChange={(e) => setUrlPath(e.target.value)}
              disabled={generatingUrl}
            />
            <p className="text-xs text-muted-foreground">
              Enter the full path to the file in the selected bucket
            </p>
          </div>

          <Button onClick={handleGenerateSignedUrl} disabled={!urlPath.trim() || generatingUrl}>
            {generatingUrl ? 'Generating...' : 'Generate Signed URL'}
          </Button>

          {signedUrl && (
            <div className="space-y-2">
              {signedUrl.startsWith('Error:') ? (
                <div className="p-4 bg-red-50 text-red-900 rounded-md">
                  <p className="font-medium">{signedUrl}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input readOnly value={signedUrl} className="font-mono text-xs" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(signedUrl)}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This URL will expire in 1 hour
                  </p>
                  <div className="mt-2">
                    <img
                      src={signedUrl}
                      alt="File preview"
                      className="max-w-sm rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete File */}
      <Card>
        <CardHeader>
          <CardTitle>Delete File</CardTitle>
          <CardDescription>
            Delete a file from the selected bucket (⚠️ irreversible)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delete-path">File Path</Label>
            <Input
              id="delete-path"
              placeholder={`${userId}/project-id/filename.jpg`}
              value={deletePath}
              onChange={(e) => setDeletePath(e.target.value)}
              disabled={deleting}
            />
          </div>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!deletePath.trim() || deleting}
          >
            {deleting ? 'Deleting...' : 'Delete File'}
          </Button>

          {deleteResult && (
            <div
              className={`p-4 rounded-md ${
                deleteResult.startsWith('✅')
                  ? 'bg-green-50 text-green-900'
                  : 'bg-red-50 text-red-900'
              }`}
            >
              <p className="font-medium">{deleteResult}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

