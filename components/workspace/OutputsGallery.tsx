'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Loader2, RefreshCw, Sparkles, Star } from 'lucide-react'
import Image from 'next/image'
import type { Asset } from '@/lib/db/asset-types'

interface OutputsGalleryProps {
  outputs: Asset[]
  onRefresh: () => void
  onCreateVariation: (assetId: string) => void
}

type TabMode = 'all' | 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging'

const MODE_TABS = [
  { id: 'all' as TabMode, label: 'All', icon: '🎨' },
  { id: 'main_white' as TabMode, label: 'Main', icon: '🎯' },
  { id: 'lifestyle' as TabMode, label: 'Lifestyle', icon: '🏡' },
  { id: 'feature_callout' as TabMode, label: 'Feature', icon: '⭐' },
  { id: 'packaging' as TabMode, label: 'Packaging', icon: '📦' },
]

export function OutputsGallery({ outputs, onRefresh, onCreateVariation }: OutputsGalleryProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('all')
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [loadingUrls, setLoadingUrls] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSignedUrls()
  }, [outputs])

  const fetchSignedUrls = async () => {
    setLoading(true)
    const urls: Record<string, string> = {}

    for (const asset of outputs) {
      try {
        const response = await fetch('/api/assets/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId: asset.id }),
        })

        if (response.ok) {
          const data = await response.json()
          urls[asset.id] = data.url
        }
      } catch (error) {
        console.error(`Error fetching signed URL for asset ${asset.id}:`, error)
      }
    }

    setSignedUrls(urls)
    setLoading(false)
  }

  const handleDownload = async (asset: Asset) => {
    const url = signedUrls[asset.id]
    if (!url) return

    setLoadingUrls(prev => new Set(prev).add(`download-${asset.id}`))

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `commercepix-${asset.mode}-${asset.id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setLoadingUrls(prev => {
        const next = new Set(prev)
        next.delete(`download-${asset.id}`)
        return next
      })
    }
  }

  const handleCreateVariation = (assetId: string) => {
    onCreateVariation(assetId)
  }

  const getModeLabel = (mode: string) => {
    const labels: Record<string, string> = {
      main_white: 'Main',
      lifestyle: 'Lifestyle',
      feature_callout: 'Feature',
      packaging: 'Packaging',
    }
    return labels[mode] || mode
  }

  const getModeColor = (mode: string) => {
    const colors: Record<string, string> = {
      main_white: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200',
      lifestyle: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200',
      feature_callout: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200',
      packaging: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-200',
    }
    return colors[mode] || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFilteredOutputs = () => {
    if (activeTab === 'all') return outputs
    return outputs.filter(output => output.mode === activeTab)
  }

  const filteredOutputs = getFilteredOutputs()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Generated Images</h3>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabMode)}>
          <TabsList className="w-full justify-start mb-4">
            {MODE_TABS.map((tab) => {
              const count = tab.id === 'all' 
                ? outputs.length 
                : outputs.filter(o => o.mode === tab.id).length
              
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5">
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredOutputs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredOutputs.map((output) => (
                <Card key={output.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="aspect-square bg-muted relative">
                    {signedUrls[output.id] ? (
                      <Image
                        src={signedUrls[output.id]}
                        alt={`${getModeLabel(output.mode || '')} image`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}

                    {/* Use as Main Image Tag */}
                    {output.mode === 'main_white' && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-amber-500 hover:bg-amber-600 flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Main
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Metadata and Actions */}
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getModeColor(output.mode || '')} variant="secondary">
                        {getModeLabel(output.mode || '')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(output.created_at)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(output)}
                        disabled={!signedUrls[output.id] || loadingUrls.has(`download-${output.id}`)}
                        className="flex-1"
                      >
                        {loadingUrls.has(`download-${output.id}`) ? (
                          <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3 mr-1.5" />
                        )}
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCreateVariation(output.id)}
                        className="flex-1"
                      >
                        <Sparkles className="h-3 w-3 mr-1.5" />
                        Variation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-muted-foreground text-center">
                No images in this mode yet.<br />
                Generate images to see them here.
              </p>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

