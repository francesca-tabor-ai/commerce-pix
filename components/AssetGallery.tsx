'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Copy, Loader2, AlertCircle } from 'lucide-react'
import type { Asset } from '@/lib/db/asset-types'

type Mode = 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging'
type FilterMode = Mode | 'all'

interface AssetGalleryProps {
  assets: Asset[]
  onCreateVariation: (asset: Asset) => void
  onRefresh: () => void
}

const MODE_LABELS: Record<Mode, string> = {
  main_white: 'Main Image (White Background)',
  lifestyle: 'Lifestyle Scene (In Context)',
  feature_callout: 'Feature Callout (Highlight Details)',
  packaging: 'Packaging / In-Box (Retail Ready)',
}

const MODE_COLORS: Record<Mode, string> = {
  main_white: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  lifestyle: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  feature_callout: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  packaging: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
}

export default function AssetGallery({ assets, onCreateVariation, onRefresh }: AssetGalleryProps) {
  const [activeTab, setActiveTab] = useState<FilterMode>('all')
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [loadingUrls, setLoadingUrls] = useState<Record<string, boolean>>({})
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({})

  // Filter assets based on active tab
  const filteredAssets = activeTab === 'all' 
    ? assets 
    : assets.filter(asset => asset.mode === activeTab)

  // Sort by created_at descending (newest first)
  const sortedAssets = [...filteredAssets].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Get unique modes from assets for tabs
  const availableModes = Array.from(new Set(assets.map(asset => asset.mode))) as Mode[]

  // Fetch signed URL for an asset
  const fetchSignedUrl = async (assetId: string) => {
    if (signedUrls[assetId] || loadingUrls[assetId]) return

    setLoadingUrls(prev => ({ ...prev, [assetId]: true }))
    setUrlErrors(prev => ({ ...prev, [assetId]: '' }))

    try {
      const response = await fetch(`/api/assets/${assetId}/signed-url`)
      const data = await response.json()

      if (response.ok && data.signedUrl) {
        setSignedUrls(prev => ({ ...prev, [assetId]: data.signedUrl }))
      } else {
        setUrlErrors(prev => ({ ...prev, [assetId]: data.error || 'Failed to load image' }))
      }
    } catch (error) {
      setUrlErrors(prev => ({ ...prev, [assetId]: 'Failed to load image' }))
    } finally {
      setLoadingUrls(prev => ({ ...prev, [assetId]: false }))
    }
  }

  // Fetch signed URLs for visible assets
  useEffect(() => {
    sortedAssets.forEach(asset => {
      fetchSignedUrl(asset.id)
    })
  }, [sortedAssets.length, activeTab])

  // Handle download
  const handleDownload = async (asset: Asset) => {
    const url = signedUrls[asset.id]
    if (!url) return

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${asset.mode}_${asset.id.slice(0, 8)}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      alert('Failed to download image')
    }
  }

  // Handle create variation
  const handleCreateVariation = (asset: Asset) => {
    onCreateVariation(asset)
  }

  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No output images yet. Upload an input image and generate your first styled image!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('all')}
        >
          All ({assets.length})
        </Button>
        {availableModes.map(mode => {
          const count = assets.filter(a => a.mode === mode).length
          return (
            <Button
              key={mode}
              variant={activeTab === mode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(mode)}
            >
              {MODE_LABELS[mode].split('(')[0].trim()} ({count})
            </Button>
          )
        })}
      </div>

      {/* Gallery Grid */}
      {sortedAssets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground text-center">
              No {activeTab === 'all' ? '' : MODE_LABELS[activeTab as Mode]} images yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAssets.map(asset => (
            <Card key={asset.id} className="overflow-hidden">
              {/* Image */}
              <div className="aspect-square bg-muted relative">
                {loadingUrls[asset.id] ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : urlErrors[asset.id] ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                    <p className="text-sm text-center text-muted-foreground">
                      {urlErrors[asset.id]}
                    </p>
                  </div>
                ) : signedUrls[asset.id] ? (
                  <img
                    src={signedUrls[asset.id]}
                    alt={`${asset.mode} image`}
                    className="w-full h-full object-contain"
                  />
                ) : null}
              </div>

              {/* Card Content */}
              <CardContent className="p-4 space-y-3">
                {/* Mode Badge */}
                <div className="flex items-center justify-between">
                  <Badge className={MODE_COLORS[asset.mode]}>
                    {MODE_LABELS[asset.mode]}
                  </Badge>
                </div>

                {/* Metadata */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(asset.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {asset.width && asset.height && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">{asset.width} × {asset.height}</span>
                    </div>
                  )}
                  {asset.prompt_payload && (
                    <>
                      {asset.prompt_payload.inputs?.productCategory && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium truncate ml-2">
                            {asset.prompt_payload.inputs.productCategory}
                          </span>
                        </div>
                      )}
                      {asset.prompt_payload.inputs?.brandTone && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tone:</span>
                          <span className="font-medium">
                            {asset.prompt_payload.inputs.brandTone}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(asset)}
                    disabled={!signedUrls[asset.id]}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCreateVariation(asset)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Variation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

