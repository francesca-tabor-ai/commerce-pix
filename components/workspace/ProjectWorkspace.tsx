'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Wand2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { UploadWidget } from './UploadWidget'
import { ProductFields } from './ProductFields'
import { ModeSelector } from './ModeSelector'
import { OutputsGallery } from './OutputsGallery'
import GenerationProgress from '../GenerationProgress'
import { UpgradeModal } from '../billing/UpgradeModal'
import type { Asset } from '@/lib/db/asset-types'

type Mode = 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging'

interface ProjectWorkspaceProps {
  projectId: string
  initialOutputs: Asset[]
}

export function ProjectWorkspace({ projectId, initialOutputs }: ProjectWorkspaceProps) {
  // Upload state
  const [uploadedAssetId, setUploadedAssetId] = useState<string | null>(null)

  // Product fields state
  const [category, setCategory] = useState('')
  const [brandTone, setBrandTone] = useState('professional')
  const [notes, setNotes] = useState('')

  // Mode state
  const [selectedMode, setSelectedMode] = useState<Mode>('main_white')

  // Generation state
  const [generating, setGenerating] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  // Outputs state
  const [outputs, setOutputs] = useState<Asset[]>(initialOutputs)
  const [loadingOutputs, setLoadingOutputs] = useState(false)

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const loadOutputs = async () => {
    setLoadingOutputs(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/outputs`)
      if (response.ok) {
        const data = await response.json()
        setOutputs(data.outputs || [])
      }
    } catch (error) {
      console.error('Error loading outputs:', error)
    } finally {
      setLoadingOutputs(false)
    }
  }

  const handleGenerate = async () => {
    if (!uploadedAssetId) {
      toast.error('No product photo', {
        description: 'Please upload a product photo first'
      })
      return
    }

    setGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputAssetId: uploadedAssetId,
          mode: selectedMode,
          productCategory: category || undefined,
          brandTone: brandTone || undefined,
          productDescription: notes || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentJobId(data.job.id)
        toast.success('Generation started!', {
          description: 'Your AI image is being created'
        })
      } else {
        setGenerating(false)
        
        if (response.status === 402) {
          // No credits
          setShowUpgradeModal(true)
        } else if (response.status === 429) {
          toast.error('Rate limit exceeded', {
            description: data.message
          })
        } else {
          toast.error('Generation failed', {
            description: data.error || 'Please try again'
          })
        }
      }
    } catch (error) {
      setGenerating(false)
      console.error('Generation error:', error)
      toast.error('Generation failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    }
  }

  const handleGenerationComplete = async () => {
    setGenerating(false)
    setCurrentJobId(null)
    await loadOutputs()
    toast.success('Image generated!', {
      description: 'Your new image is ready'
    })
  }

  const handleDismissProgress = () => {
    setGenerating(false)
    setCurrentJobId(null)
  }

  const handleCreateVariation = (assetId: string) => {
    toast.info('Create variation', {
      description: 'This feature will use the same settings to create a variation'
    })
    // TODO: Implement variation logic
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="space-y-6">
        <UploadWidget
          projectId={projectId}
          onUploadComplete={(assetId) => setUploadedAssetId(assetId)}
        />

        <ProductFields
          category={category}
          onCategoryChange={setCategory}
          brandTone={brandTone}
          onBrandToneChange={setBrandTone}
          notes={notes}
          onNotesChange={setNotes}
        />

        <ModeSelector
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
        />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Generate Button */}
        <Card>
          <CardContent className="p-6">
            <Button
              onClick={handleGenerate}
              disabled={generating || !uploadedAssetId}
              size="lg"
              className="w-full"
              aria-label={generating ? 'Generating image' : 'Generate image'}
              aria-live="polite"
              aria-busy={generating}
            >
              {generating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" aria-hidden="true" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-2" aria-hidden="true" />
                  Generate Image
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              {uploadedAssetId
                ? 'Click to generate your AI-powered product image'
                : 'Upload a product photo to get started'}
            </p>
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

        {/* Outputs Gallery */}
        <OutputsGallery
          outputs={outputs}
          onRefresh={loadOutputs}
          onCreateVariation={handleCreateVariation}
        />
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

