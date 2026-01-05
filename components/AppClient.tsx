'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Upload, Wand2, Loader2, Image as ImageIcon, RefreshCw } from 'lucide-react'
import { getProjectsClient, createProjectClient } from '@/lib/db/projects-client'
import { getAssetsClient } from '@/lib/db/assets-client'
import type { Project } from '@/lib/db/types'
import type { Asset } from '@/lib/db/asset-types'
import UploadComponent from '@/components/UploadComponent'
import ModeSelector from '@/components/ModeSelector'
import GenerationProgress from '@/components/GenerationProgress'
import AssetGallery from '@/components/AssetGallery'
import { UpgradeModal } from '@/components/billing/UpgradeModal'

type Mode = 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging'

interface ModeSettings {
  mode: Mode
  productCategory?: string
  brandTone?: string
  productDescription?: string
  scene?: string
}

export default function AppClient({ userId }: { userId: string }) {
  // Projects state
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [creatingProject, setCreatingProject] = useState(false)

  // Upload state - simplified, handled by UploadComponent
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null)

  // Generate state
  const [inputAssetId, setInputAssetId] = useState('')
  const [modeSettings, setModeSettings] = useState<ModeSettings>({
    mode: 'main_white',
    productCategory: '',
    brandTone: '',
    productDescription: '',
    scene: '',
  })
  const [generating, setGenerating] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Gallery state
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      loadAssets()
    }
  }, [selectedProject])

  const loadProjects = async () => {
    try {
      const data = await getProjectsClient()
      setProjects(data)
      if (data.length > 0 && !selectedProject) {
        setSelectedProject(data[0])
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return

    setCreatingProject(true)
    try {
      const project = await createProjectClient({ name: newProjectName })
      if (project) {
        setProjects([...projects, project])
        setSelectedProject(project)
        setNewProjectName('')
      }
    } catch (error) {
      console.error('Failed to create project:', error)
      alert('Failed to create project')
    } finally {
      setCreatingProject(false)
    }
  }

  const loadAssets = async () => {
    if (!selectedProject) return

    setLoadingAssets(true)
    try {
      const data = await getAssetsClient()
      // Filter assets for selected project
      const projectAssets = data.filter(a => a.project_id === selectedProject.id)
      setAssets(projectAssets)

      // Load signed URLs for all assets
      for (const asset of projectAssets) {
        if (!signedUrls[asset.id]) {
          fetchSignedUrl(asset.id)
        }
      }
    } catch (error) {
      console.error('Failed to load assets:', error)
    } finally {
      setLoadingAssets(false)
    }
  }

  const fetchSignedUrl = async (assetId: string) => {
    try {
      const response = await fetch(`/api/assets/${assetId}/signed-url?expiresIn=3600`)
      const data = await response.json()
      if (response.ok && data.signedUrl) {
        setSignedUrls(prev => ({ ...prev, [assetId]: data.signedUrl }))
      }
    } catch (error) {
      console.error(`Failed to fetch signed URL for ${assetId}:`, error)
    }
  }

  const handleGenerate = async () => {
    if (!inputAssetId) {
      alert('Please upload an input image first')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputAssetId,
          mode: modeSettings.mode,
          productDescription: modeSettings.productDescription || undefined,
          productCategory: modeSettings.productCategory || undefined,
          brandTone: modeSettings.brandTone || undefined,
          constraints: modeSettings.scene ? [`Scene: ${modeSettings.scene}`] : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store job ID for progress tracking
        setCurrentJobId(data.job.id)
      } else {
        setGenerating(false)
        if (response.status === 402) {
          // No credits - show upgrade modal
          setShowUpgradeModal(true)
        } else if (response.status === 429) {
          alert(`Rate limit exceeded: ${data.message}`)
        } else {
          alert(`Generation failed: ${data.error}`)
        }
      }
    } catch (error) {
      setGenerating(false)
      alert(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleGenerationComplete = async () => {
    // Refresh gallery to show new output
    await loadAssets()
    setGenerating(false)
    setCurrentJobId(null)
  }

  const handleDismissProgress = () => {
    setGenerating(false)
    setCurrentJobId(null)
  }

  const handleCreateVariation = (asset: Asset) => {
    // Populate settings from the asset's prompt_payload
    if (asset.prompt_payload?.inputs) {
      setModeSettings({
        mode: asset.mode,
        productCategory: asset.prompt_payload.inputs.productCategory || '',
        brandTone: asset.prompt_payload.inputs.brandTone || '',
        productDescription: asset.prompt_payload.inputs.productDescription || '',
        scene: asset.prompt_payload.inputs.scene || '',
      })
    } else {
      // Fallback: just set the mode
      setModeSettings(prev => ({ ...prev, mode: asset.mode }))
    }

    // Set the source asset as input if available
    if (asset.source_asset_id) {
      setInputAssetId(asset.source_asset_id)
    }

    // Scroll to generate section
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const inputAssets = assets.filter(a => a.kind === 'input')
  const outputAssets = assets.filter(a => a.kind === 'output')

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 border-r bg-secondary/20 p-4 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-3">Projects</h2>
            <div className="space-y-2">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedProject?.id === project.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  }`}
                >
                  {project.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Input
              placeholder="New project name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              disabled={creatingProject}
            />
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || creatingProject}
              className="w-full"
              size="sm"
            >
              {creatingProject ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {!selectedProject ? (
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Commerce PIX</CardTitle>
                <CardDescription>Create a project to get started</CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
                <p className="text-muted-foreground text-sm">
                  Upload product images and generate styled variations
                </p>
              </div>

              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Product Image
                  </CardTitle>
                  <CardDescription>
                    Drag & drop or click to upload a product image (jpg/png/webp, max 8MB)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedProject ? (
                    <UploadComponent
                      projectId={selectedProject.id}
                      onUploadSuccess={handleUploadSuccess}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a project first</p>
                  )}
                </CardContent>
              </Card>

              {/* Generate Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wand2 className="h-5 w-5 mr-2" />
                    Generate Styled Image
                  </CardTitle>
                  <CardDescription>
                    Transform your product image into different styles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Input Image</Label>
                    <Select value={inputAssetId} onValueChange={setInputAssetId} disabled={generating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an uploaded image" />
                      </SelectTrigger>
                      <SelectContent>
                        {inputAssets.map(asset => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.storage_path.split('/').pop()} - {new Date(asset.created_at).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <ModeSelector
                    value={modeSettings}
                    onChange={setModeSettings}
                    disabled={generating}
                  />

                  <Button onClick={handleGenerate} disabled={!inputAssetId || generating}>
                    {generating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Generation Progress */}
              {currentJobId && (
                <GenerationProgress
                  jobId={currentJobId}
                  onComplete={handleGenerationComplete}
                  onDismiss={handleDismissProgress}
                />
              )}

              {/* Results Gallery */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Results Gallery</h2>
                  <Button onClick={loadAssets} variant="outline" size="sm" disabled={loadingAssets}>
                    {loadingAssets ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </>
                    )}
                  </Button>
                </div>
                
                <AssetGallery
                  assets={outputAssets}
                  onCreateVariation={handleCreateVariation}
                  onRefresh={loadAssets}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        reason="no_credits"
      />
    </div>
  )
}

