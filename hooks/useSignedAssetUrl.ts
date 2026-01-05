import { useState, useEffect, useRef, useCallback } from 'react'

interface CachedUrl {
  url: string
  expiresAt: number
  fetchedAt: number
}

interface UseSignedAssetUrlOptions {
  /**
   * Cache duration in milliseconds (default: 10 minutes)
   */
  cacheDuration?: number
  /**
   * Whether to automatically refetch when URL expires
   */
  autoRefetch?: boolean
  /**
   * Callback when URL is fetched successfully
   */
  onSuccess?: (url: string) => void
  /**
   * Callback when fetch fails
   */
  onError?: (error: Error) => void
}

interface UseSignedAssetUrlReturn {
  /**
   * The signed URL (null if loading or error)
   */
  url: string | null
  /**
   * Whether the URL is currently being fetched
   */
  loading: boolean
  /**
   * Error if fetch failed
   */
  error: Error | null
  /**
   * Manually refetch the URL
   */
  refetch: () => Promise<void>
  /**
   * Whether the URL is from cache
   */
  isFromCache: boolean
}

// Global cache for signed URLs (shared across hook instances)
const urlCache = new Map<string, CachedUrl>()

/**
 * Hook to fetch and cache signed URLs for assets
 * 
 * Features:
 * - 10-minute client-side caching by default
 * - Automatic refetch on expiry
 * - Graceful error handling
 * - Image preloading support
 * 
 * @example
 * ```tsx
 * const { url, loading, error, refetch } = useSignedAssetUrl(assetId)
 * 
 * if (loading) return <Spinner />
 * if (error) return <ErrorMessage error={error} onRetry={refetch} />
 * if (!url) return null
 * 
 * return <img src={url} alt="Asset" />
 * ```
 */
export function useSignedAssetUrl(
  assetId: string | null | undefined,
  options: UseSignedAssetUrlOptions = {}
): UseSignedAssetUrlReturn {
  const {
    cacheDuration = 10 * 60 * 1000, // 10 minutes
    autoRefetch = true,
    onSuccess,
    onError,
  } = options

  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const fetchUrl = useCallback(async () => {
    if (!assetId) {
      setUrl(null)
      setLoading(false)
      setError(null)
      setIsFromCache(false)
      return
    }

    // Check cache first
    const cached = urlCache.get(assetId)
    const now = Date.now()

    if (cached) {
      // Check if cache is still valid
      if (now < cached.expiresAt) {
        setUrl(cached.url)
        setLoading(false)
        setError(null)
        setIsFromCache(true)

        // Schedule refetch before expiry if autoRefetch is enabled
        if (autoRefetch) {
          const timeUntilExpiry = cached.expiresAt - now
          const refetchTime = Math.max(0, timeUntilExpiry - 30000) // Refetch 30s before expiry

          if (refetchTimeoutRef.current) {
            clearTimeout(refetchTimeoutRef.current)
          }

          refetchTimeoutRef.current = setTimeout(() => {
            fetchUrl()
          }, refetchTime)
        }

        return
      } else {
        // Cache expired, remove it
        urlCache.delete(assetId)
      }
    }

    // Fetch from API
    setLoading(true)
    setError(null)
    setIsFromCache(false)

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(`/api/assets/${assetId}/signed-url?expiresIn=600`, {
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      const signedUrl = data.signedUrl

      if (!signedUrl) {
        throw new Error('No signed URL in response')
      }

      // Cache the URL
      const expiresAt = now + cacheDuration
      urlCache.set(assetId, {
        url: signedUrl,
        expiresAt,
        fetchedAt: now,
      })

      setUrl(signedUrl)
      setError(null)
      onSuccess?.(signedUrl)

      // Schedule refetch before expiry if autoRefetch is enabled
      if (autoRefetch) {
        const refetchTime = cacheDuration - 30000 // Refetch 30s before expiry

        if (refetchTimeoutRef.current) {
          clearTimeout(refetchTimeoutRef.current)
        }

        refetchTimeoutRef.current = setTimeout(() => {
          fetchUrl()
        }, Math.max(0, refetchTime))
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, ignore
        return
      }

      const error = err instanceof Error ? err : new Error('Failed to fetch signed URL')
      setError(error)
      setUrl(null)
      onError?.(error)
      console.error('Error fetching signed URL:', error)
    } finally {
      setLoading(false)
    }
  }, [assetId, cacheDuration, autoRefetch, onSuccess, onError])

  const refetch = useCallback(async () => {
    // Clear cache for this asset
    if (assetId) {
      urlCache.delete(assetId)
    }
    await fetchUrl()
  }, [assetId, fetchUrl])

  useEffect(() => {
    fetchUrl()

    return () => {
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current)
      }
    }
  }, [fetchUrl])

  return {
    url,
    loading,
    error,
    refetch,
    isFromCache,
  }
}

/**
 * Clear all cached URLs
 * Useful for logout or manual cache invalidation
 */
export function clearSignedUrlCache() {
  urlCache.clear()
}

/**
 * Clear cached URL for a specific asset
 */
export function clearSignedUrlCacheForAsset(assetId: string) {
  urlCache.delete(assetId)
}

/**
 * Get cache statistics (for debugging)
 */
export function getSignedUrlCacheStats() {
  const now = Date.now()
  const entries = Array.from(urlCache.entries())
  
  return {
    total: entries.length,
    valid: entries.filter(([_, cached]) => now < cached.expiresAt).length,
    expired: entries.filter(([_, cached]) => now >= cached.expiresAt).length,
  }
}

