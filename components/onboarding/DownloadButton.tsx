'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { markAssetDownloadedAction } from '@/app/actions/onboarding'
import { useState } from 'react'

interface DownloadButtonProps {
  assetId: string
  assetUrl: string
  fileName?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function DownloadButton({
  assetId,
  assetUrl,
  fileName = 'download.png',
  variant = 'outline',
  size = 'sm',
  className,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      // Download the file
      const response = await fetch(assetUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      // Track onboarding progress (don't await to not block UX)
      markAssetDownloadedAction().catch((error) => {
        console.error('Failed to track download in onboarding:', error)
      })
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading}
      className={className}
    >
      <Download className="h-4 w-4 mr-2" />
      {isDownloading ? 'Downloading...' : 'Download'}
    </Button>
  )
}

