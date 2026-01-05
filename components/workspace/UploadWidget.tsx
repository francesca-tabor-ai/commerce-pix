'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface UploadWidgetProps {
  projectId: string
  onUploadComplete?: (assetId: string) => void
}

export function UploadWidget({ projectId, onUploadComplete }: UploadWidgetProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFile(files[0])
    }
  }, [projectId])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (PNG, JPG, etc.)'
      })
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please upload an image smaller than 10MB'
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (response.ok) {
        const previewUrl = URL.createObjectURL(file)
        setUploadedFile({ url: previewUrl, name: file.name })
        toast.success('Image uploaded!', {
          description: 'Ready to generate AI images'
        })
        onUploadComplete?.(data.assetId)
      } else {
        toast.error('Upload failed', {
          description: data.error || 'Please try again'
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemove = () => {
    if (uploadedFile?.url) {
      URL.revokeObjectURL(uploadedFile.url)
    }
    setUploadedFile(null)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold mb-3" id="upload-label">Product Photo</h3>

        {!uploadedFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={uploading ? -1 : 0}
            aria-labelledby="upload-label"
            aria-describedby="upload-instructions"
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                document.getElementById('file-upload')?.click()
              }
            }}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="text-primary font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 transition-all duration-300 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    {uploadProgress < 30 && 'Preparing image...'}
                    {uploadProgress >= 30 && uploadProgress < 70 && 'Uploading to server...'}
                    {uploadProgress >= 70 && uploadProgress < 100 && 'Processing...'}
                    {uploadProgress === 100 && 'Complete!'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium mb-1">
                  Drag and drop your product photo
                </p>
                <p id="upload-instructions" className="text-xs text-muted-foreground mb-4">
                  or click to browse (PNG, JPG, max 10MB)
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  aria-label="Upload product photo"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" size="sm" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </>
            )}
          </div>
        ) : (
          <div className="relative">
            <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
              <Image
                src={uploadedFile.url}
                alt="Uploaded product"
                fill
                className="object-contain"
              />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground truncate">
                  {uploadedFile.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

