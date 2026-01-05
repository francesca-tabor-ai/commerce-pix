'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import type { Asset } from '@/lib/db/asset-types'
import { DashboardGallerySkeleton } from '../workspace/GallerySkeleton'

interface DashboardOutputGalleryProps {
  outputs: Asset[]
}

export function DashboardOutputGallery({ outputs }: DashboardOutputGalleryProps) {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSignedUrls() {
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

    fetchSignedUrls()
  }, [outputs])

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
      main_white: 'bg-blue-100 text-blue-700',
      lifestyle: 'bg-green-100 text-green-700',
      feature_callout: 'bg-purple-100 text-purple-700',
      packaging: 'bg-orange-100 text-orange-700',
    }
    return colors[mode] || 'bg-gray-100 text-gray-700'
  }

  const handleDownload = async (asset: Asset) => {
    const url = signedUrls[asset.id]
    if (!url) return

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
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <DashboardGallerySkeleton count={outputs.length || 12} />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {outputs.map((asset) => (
        <Card key={asset.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
          {/* Image */}
          <div className="aspect-square bg-muted relative">
            {signedUrls[asset.id] ? (
              <Image
                src={signedUrls[asset.id]}
                alt={`${getModeLabel(asset.mode || '')} image`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDownload(asset)}
                disabled={!signedUrls[asset.id]}
              >
                <Download className="h-4 w-4" />
              </Button>
              {signedUrls[asset.id] && (
                <a
                  href={signedUrls[asset.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="sm" variant="secondary">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={getModeColor(asset.mode || '')} variant="secondary">
                {getModeLabel(asset.mode || '')}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(asset.created_at)}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

