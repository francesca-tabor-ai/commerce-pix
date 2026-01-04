'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'

interface UploadComponentProps {
  projectId: string
  onUploadSuccess: (assetId: string) => void
  disabled?: boolean
}

export default function UploadComponent({ projectId, onUploadSuccess, disabled }: UploadComponentProps) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mode, setMode] = useState('main_white')
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = useCallback((selectedFile: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please select a valid image file (jpg, png, or webp)')
      return
    }

    // Validate file size (8MB max)
    const maxSize = 8 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      alert('File size must be less than 8MB')
      return
    }

    // Set file and create preview
    setFile(selectedFile)
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleRemove = () => {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!file || !projectId) {
      alert('Please select a file')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)
      formData.append('mode', mode)

      const response = await fetch('/api/assets/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        // Success! Store asset ID and clear form
        onUploadSuccess(data.assetId)
        handleRemove()
        alert('Upload successful! You can now generate images.')
      } else {
        alert(`Upload failed: ${data.error}`)
      }
    } catch (error) {
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone or Preview */}
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={disabled || uploading}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-4 p-4 bg-secondary rounded-full">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium mb-1">
              {isDragging ? 'Drop image here' : 'Drag & drop image here'}
            </p>
            <p className="text-xs text-muted-foreground mb-2">or click to browse</p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, or WebP (max 8MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative border-2 border-muted rounded-lg p-4 bg-secondary/20">
          {/* Preview */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0 w-32 h-32 bg-secondary rounded-md overflow-hidden">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file.type}
                  </p>
                </div>
                <Button
                  onClick={handleRemove}
                  variant="ghost"
                  size="sm"
                  disabled={uploading || disabled}
                  className="shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selector */}
      {file && (
        <div className="space-y-2">
          <Label>Initial Mode</Label>
          <Select value={mode} onValueChange={setMode} disabled={uploading || disabled}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main_white">Main White</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="feature_callout">Feature Callout</SelectItem>
              <SelectItem value="packaging">Packaging</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Upload Button */}
      {file && (
        <Button
          onClick={handleUpload}
          disabled={!file || uploading || disabled}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload to Project
            </>
          )}
        </Button>
      )}
    </div>
  )
}

