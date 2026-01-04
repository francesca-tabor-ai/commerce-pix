'use client'

import { useState, useEffect } from 'react'
import { getProjectAssetsClient, createAssetClient, updateAssetClient, deleteAssetClient, getDerivedAssetsClient } from '@/lib/db/assets-client'
import { getProjectsClient } from '@/lib/db/projects-client'
import type { Asset, AssetKind, AssetMode } from '@/lib/db/asset-types'
import type { Project } from '@/lib/db/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function AssetsTestClient() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [kind, setKind] = useState<AssetKind>('input')
  const [mode, setMode] = useState<AssetMode>('main_white')
  const [sourceAssetId, setSourceAssetId] = useState<string>('')
  const [promptVersion, setPromptVersion] = useState('v1')
  const [storagePath, setStoragePath] = useState('')
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [mimeType, setMimeType] = useState('image/png')
  const [promptPayload, setPromptPayload] = useState('{"example": "data"}')

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  // Load assets when project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadAssets()
    }
  }, [selectedProjectId])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await getProjectsClient()
      setProjects(data)
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const loadAssets = async () => {
    if (!selectedProjectId) return
    
    try {
      setError(null)
      const data = await getProjectAssetsClient(selectedProjectId)
      setAssets(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load assets')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) {
      setError('Please select a project first')
      return
    }

    try {
      setError(null)
      
      // Parse JSON payload
      let payload
      try {
        payload = JSON.parse(promptPayload)
      } catch {
        setError('Invalid JSON in prompt payload')
        return
      }

      await createAssetClient({
        project_id: selectedProjectId,
        kind,
        mode,
        source_asset_id: sourceAssetId || null,
        prompt_version: promptVersion,
        prompt_payload: payload,
        width: width ? parseInt(width) : null,
        height: height ? parseInt(height) : null,
        mime_type: mimeType || null,
        storage_path: storagePath,
      })
      
      // Reset form
      setStoragePath('')
      setWidth('')
      setHeight('')
      setSourceAssetId('')
      setPromptPayload('{"example": "data"}')
      
      await loadAssets()
    } catch (err: any) {
      setError(err.message || 'Failed to create asset')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return

    try {
      setError(null)
      await deleteAssetClient(id)
      await loadAssets()
    } catch (err: any) {
      setError(err.message || 'Failed to delete asset')
    }
  }

  const viewDerivedAssets = async (assetId: string) => {
    try {
      const derived = await getDerivedAssetsClient(assetId)
      alert(`Found ${derived.length} derived assets:\n${derived.map(a => `- ${a.mode} (${a.id})`).join('\n')}`)
    } catch (err: any) {
      setError(err.message || 'Failed to load derived assets')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Projects Found</CardTitle>
          <CardDescription>
            You need to create a project first before creating assets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/projects-test" className="text-primary hover:underline">
            Go to Projects Test Page →
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Project selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Create new asset form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Asset</CardTitle>
          <CardDescription>Add a new asset to the selected project</CardDescription>
        </CardHeader>
        <form onSubmit={handleCreate}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kind">Kind</Label>
                <select
                  id="kind"
                  value={kind}
                  onChange={(e) => setKind(e.target.value as AssetKind)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="input">Input</option>
                  <option value="output">Output</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <select
                  id="mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as AssetMode)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="main_white">Main White</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="feature_callout">Feature Callout</option>
                  <option value="packaging">Packaging</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage-path">Storage Path *</Label>
              <Input
                id="storage-path"
                placeholder="/uploads/image-123.png"
                value={storagePath}
                onChange={(e) => setStoragePath(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prompt-version">Prompt Version</Label>
                <Input
                  id="prompt-version"
                  placeholder="v1"
                  value={promptVersion}
                  onChange={(e) => setPromptVersion(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mime-type">MIME Type</Label>
                <Input
                  id="mime-type"
                  placeholder="image/png"
                  value={mimeType}
                  onChange={(e) => setMimeType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  placeholder="1024"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="768"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-asset">Source Asset ID (for outputs)</Label>
              <Input
                id="source-asset"
                placeholder="Leave empty for input assets"
                value={sourceAssetId}
                onChange={(e) => setSourceAssetId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt-payload">Prompt Payload (JSON)</Label>
              <textarea
                id="prompt-payload"
                className="w-full p-2 border rounded-md font-mono text-sm"
                rows={3}
                value={promptPayload}
                onChange={(e) => setPromptPayload(e.target.value)}
                required
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit">Create Asset</Button>
          </CardFooter>
        </form>
      </Card>

      {/* Error display */}
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/30">
          {error}
        </div>
      )}

      {/* Assets list */}
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
          <CardDescription>
            {assets.length === 0 ? 'No assets yet' : `${assets.length} asset${assets.length === 1 ? '' : 's'}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Create your first asset to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          asset.kind === 'input' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {asset.kind}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                          {asset.mode}
                        </span>
                        {asset.width && asset.height && (
                          <span className="text-xs text-muted-foreground">
                            {asset.width}x{asset.height}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-mono text-muted-foreground">
                        {asset.storage_path}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {new Date(asset.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {asset.kind === 'input' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewDerivedAssets(asset.id)}
                        >
                          View Outputs
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(asset.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Show details
                    </summary>
                    <div className="mt-2 p-2 bg-muted rounded font-mono">
                      <div><strong>ID:</strong> {asset.id}</div>
                      <div><strong>Prompt Version:</strong> {asset.prompt_version}</div>
                      {asset.source_asset_id && (
                        <div><strong>Source Asset:</strong> {asset.source_asset_id}</div>
                      )}
                      <div><strong>Prompt Payload:</strong></div>
                      <pre className="mt-1 overflow-x-auto">{JSON.stringify(asset.prompt_payload, null, 2)}</pre>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

