'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useSignedAssetUrl } from '@/hooks/useSignedAssetUrl'
import { Button } from './ui/button'

interface AssetImageProps {
  assetId: string
  alt?: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
  /**
   * Show loading spinner
   */
  showLoading?: boolean
  /**
   * Show error UI with retry button
   */
  showError?: boolean
  /**
   * Custom loading component
   */
  LoadingComponent?: React.ComponentType
  /**
   * Custom error component
   */
  ErrorComponent?: React.ComponentType<{ error: Error; onRetry: () => void }>
  /**
   * Callback when image loads successfully
   */
  onLoad?: () => void
  /**
   * Callback when image fails to load
   */
  onError?: (error: Error) => void
}

/**
 * Component for displaying assets with automatic signed URL fetching and caching
 * 
 * Features:
 * - Automatic signed URL fetching
 * - 10-minute client-side caching
 * - Automatic refetch on expiry
 * - Loading and error states
 * - Next.js Image optimization
 * 
 * @example
 * ```tsx
 * <AssetImage
 *   assetId={asset.id}
 *   alt="Product image"
 *   fill
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 * ```
 */
export function AssetImage({
  assetId,
  alt = 'Asset',
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  showLoading = true,
  showError = true,
  LoadingComponent,
  ErrorComponent,
  onLoad,
  onError,
}: AssetImageProps) {
  const { url, loading, error, refetch } = useSignedAssetUrl(assetId, {
    onSuccess: () => onLoad?.(),
    onError: (err) => onError?.(err),
  })

  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
    onError?.(new Error('Image failed to load'))
  }

  const handleRetry = () => {
    setImageError(false)
    refetch()
  }

  // Loading state
  if (loading) {
    if (LoadingComponent) {
      return <LoadingComponent />
    }

    if (showLoading) {
      return (
        <div className={`flex items-center justify-center bg-muted ${className}`}>
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )
    }

    return null
  }

  // Error state
  if (error || imageError) {
    if (ErrorComponent) {
      return <ErrorComponent error={error || new Error('Image failed to load')} onRetry={handleRetry} />
    }

    if (showError) {
      return (
        <div className={`flex flex-col items-center justify-center gap-3 bg-muted p-4 ${className}`}>
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground text-center">
            Failed to load image
          </p>
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw className="h-3 w-3 mr-2" />
            Retry
          </Button>
        </div>
      )
    }

    return null
  }

  // No URL yet
  if (!url) {
    return null
  }

  // Render image
  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={handleImageError}
      />
    )
  }

  if (width && height) {
    return (
      <Image
        src={url}
        alt={alt}
        width={width}
        height={height}
        className={className}
        sizes={sizes}
        priority={priority}
        onError={handleImageError}
      />
    )
  }

  // Fallback to img tag if dimensions not provided
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      onError={handleImageError}
    />
  )
}

/**
 * Simplified version for background images
 */
export function AssetBackgroundImage({
  assetId,
  className,
  children,
}: {
  assetId: string
  className?: string
  children?: React.ReactNode
}) {
  const { url, loading } = useSignedAssetUrl(assetId)

  if (loading || !url) {
    return (
      <div className={`bg-muted ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <div
      className={className}
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {children}
    </div>
  )
}

