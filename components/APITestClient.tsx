'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getProjectsClient } from '@/lib/db/projects-client'
import type { Project } from '@/lib/db/types'

export default function APITestClient({ userId }: { userId: string }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  
  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadMode, setUploadMode] = useState('main_white')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  
  // Generate state
  const [inputAssetId, setInputAssetId] = useState('')
  const [generateMode, setGenerateMode] = useState('main_white')
  const [customPrompt, setCustomPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generateResult, setGenerateResult] = useState<any>(null)
  
  // Signed URL state
  const [assetId, setAssetId] = useState('')
  const [fetchingUrl, setFetchingUrl] = useState(false)
  const [signedUrlResult, setSignedUrlResult] = useState<any>(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await getProjectsClient()
      setProjects(data)
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const handleUpload = async () => {
    if (!uploadFile || !selectedProjectId) {
      alert('Please select a file and project')
      return
    }

    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('projectId', selectedProjectId)
      formData.append('mode', uploadMode)
      formData.append('promptVersion', 'v1')
      formData.append('promptPayload', JSON.stringify({ description: 'a product' }))

      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setUploadResult(data)
        setInputAssetId(data.asset.id) // Auto-fill for generate test
      } else {
        setUploadResult({ error: data.error })
      }
    } catch (error) {
      setUploadResult({ error: error instanceof Error ? error.message : 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  const handleGenerate = async () => {
    if (!inputAssetId) {
      alert('Please enter an input asset ID')
      return
    }

    setGenerating(true)
    setGenerateResult(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputAssetId,
          mode: generateMode,
          prompt: customPrompt || undefined,
          promptVersion: 'v1',
          promptPayload: { description: 'a product' },
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setGenerateResult(data)
      } else {
        setGenerateResult({ error: data.error })
      }
    } catch (error) {
      setGenerateResult({ error: error instanceof Error ? error.message : 'Generation failed' })
    } finally {
      setGenerating(false)
    }
  }

  const handleGetSignedUrl = async () => {
    if (!assetId) {
      alert('Please enter an asset ID')
      return
    }

    setFetchingUrl(true)
    setSignedUrlResult(null)

    try {
      const response = await fetch(`/api/assets/${assetId}/signed-url?expiresIn=3600`)

      const data = await response.json()

      if (response.ok) {
        setSignedUrlResult(data)
      } else {
        setSignedUrlResult({ error: data.error })
      }
    } catch (error) {
      setSignedUrlResult({ error: error instanceof Error ? error.message : 'Failed to get URL' })
    } finally {
      setFetchingUrl(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Project Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No projects found. <a href="/projects-test" className="text-primary hover:underline">Create one first</a>
            </p>
          ) : (
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* 1. Upload Asset */}
      <Card>
        <CardHeader>
          <CardTitle>1. POST /api/assets/upload</CardTitle>
          <CardDescription>Upload an input image asset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>File</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
              disabled={uploading}
            />
          </div>

          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={uploadMode} onValueChange={setUploadMode} disabled={uploading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main_white">Main White</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="feature_callout">Feature Callout</SelectItem>
                <SelectItem value="packaging">Packaging</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleUpload} disabled={!uploadFile || !selectedProjectId || uploading}>
            {uploading ? 'Uploading...' : 'Upload Asset'}
          </Button>

          {uploadResult && (
            <div className={`p-4 rounded-md ${uploadResult.error ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'}`}>
              {uploadResult.error ? (
                <p className="font-medium">{uploadResult.error}</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><strong>Asset ID:</strong> {uploadResult.asset.id}</p>
                  <p><strong>Storage Path:</strong> {uploadResult.asset.storage_path}</p>
                  <p><strong>Kind:</strong> {uploadResult.asset.kind}</p>
                  <p><strong>Mode:</strong> {uploadResult.asset.mode}</p>
                  {uploadResult.signedUrl && (
                    <div className="mt-2">
                      <img src={uploadResult.signedUrl} alt="Uploaded" className="max-w-xs rounded border" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Generate Image */}
      <Card>
        <CardHeader>
          <CardTitle>2. POST /api/generate</CardTitle>
          <CardDescription>Trigger AI generation with OpenAI DALL-E</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Input Asset ID</Label>
            <Input
              placeholder="Enter asset ID from upload"
              value={inputAssetId}
              onChange={(e) => setInputAssetId(e.target.value)}
              disabled={generating}
            />
          </div>

          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={generateMode} onValueChange={setGenerateMode} disabled={generating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main_white">Main White</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
                <SelectItem value="feature_callout">Feature Callout</SelectItem>
                <SelectItem value="packaging">Packaging</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Custom Prompt (optional)</Label>
            <Textarea
              placeholder="Leave empty to use default prompt for mode"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              disabled={generating}
            />
          </div>

          <Button onClick={handleGenerate} disabled={!inputAssetId || generating}>
            {generating ? 'Generating...' : 'Generate Image'}
          </Button>

          {generateResult && (
            <div className={`p-4 rounded-md ${generateResult.error ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'}`}>
              {generateResult.error ? (
                <p className="font-medium">{generateResult.error}</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><strong>Job ID:</strong> {generateResult.job.id}</p>
                  <p><strong>Status:</strong> {generateResult.job.status}</p>
                  <p><strong>Mode:</strong> {generateResult.job.mode}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {generateResult.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Check the jobs test page to see the job status and get the output asset ID.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Get Signed URL */}
      <Card>
        <CardHeader>
          <CardTitle>3. GET /api/assets/[id]/signed-url</CardTitle>
          <CardDescription>Get a signed URL for any asset</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Asset ID</Label>
            <Input
              placeholder="Enter asset ID (input or output)"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              disabled={fetchingUrl}
            />
          </div>

          <Button onClick={handleGetSignedUrl} disabled={!assetId || fetchingUrl}>
            {fetchingUrl ? 'Fetching...' : 'Get Signed URL'}
          </Button>

          {signedUrlResult && (
            <div className={`p-4 rounded-md ${signedUrlResult.error ? 'bg-red-50 text-red-900' : 'bg-green-50 text-green-900'}`}>
              {signedUrlResult.error ? (
                <p className="font-medium">{signedUrlResult.error}</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><strong>Asset ID:</strong> {signedUrlResult.asset.id}</p>
                  <p><strong>Kind:</strong> {signedUrlResult.asset.kind}</p>
                  <p><strong>Mode:</strong> {signedUrlResult.asset.mode}</p>
                  <p><strong>Expires In:</strong> {signedUrlResult.expiresIn}s</p>
                  <div className="mt-2">
                    <Label>Signed URL:</Label>
                    <Input readOnly value={signedUrlResult.signedUrl} className="text-xs font-mono" />
                  </div>
                  <div className="mt-2">
                    <img src={signedUrlResult.signedUrl} alt="Asset" className="max-w-xs rounded border" />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

