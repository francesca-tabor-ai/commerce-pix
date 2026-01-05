'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Copy, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ErrorDetails {
  message: string
  stack?: string
  timestamp?: string
  mode?: string
  userId?: string
  requestId?: string
}

interface ErrorDetailsDialogProps {
  error: string | null
  jobId?: string
  trigger?: React.ReactNode
}

export function ErrorDetailsDialog({ error, jobId, trigger }: ErrorDetailsDialogProps) {
  const [copied, setCopied] = useState(false)

  if (!error) {
    return null
  }

  // Try to parse error as JSON for detailed info
  let errorDetails: ErrorDetails | null = null
  let displayMessage = error

  try {
    errorDetails = JSON.parse(error)
    displayMessage = errorDetails.message
  } catch {
    // Not JSON, use as-is
    displayMessage = error
  }

  const handleCopy = () => {
    const copyText = errorDetails
      ? JSON.stringify(errorDetails, null, 2)
      : error

    navigator.clipboard.writeText(copyText)
    setCopied(true)
    toast.success('Error details copied to clipboard')

    setTimeout(() => setCopied(false), 2000)
  }

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'Unknown'
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return timestamp
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            View Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <DialogTitle>Generation Error Details</DialogTitle>
          </div>
          <DialogDescription>
            Information about what went wrong with this generation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main Error Message */}
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
            <h4 className="font-semibold text-destructive mb-2">Error Message</h4>
            <p className="text-sm text-foreground">{displayMessage}</p>
          </div>

          {/* Error Metadata */}
          {errorDetails && (
            <div className="grid grid-cols-2 gap-3">
              {errorDetails.timestamp && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Occurred At</p>
                  <p className="text-sm font-medium">{formatTimestamp(errorDetails.timestamp)}</p>
                </div>
              )}

              {errorDetails.mode && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Generation Mode</p>
                  <Badge variant="outline">{errorDetails.mode}</Badge>
                </div>
              )}

              {errorDetails.requestId && (
                <div className="p-3 bg-muted rounded-md col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Request ID (for support)</p>
                  <p className="text-xs font-mono text-foreground">{errorDetails.requestId}</p>
                </div>
              )}

              {jobId && (
                <div className="p-3 bg-muted rounded-md col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Job ID</p>
                  <p className="text-xs font-mono text-foreground">{jobId}</p>
                </div>
              )}
            </div>
          )}

          {/* Stack Trace (if available) */}
          {errorDetails?.stack && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Technical Details</h4>
              <div className="p-3 bg-muted rounded-md overflow-x-auto">
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                  {errorDetails.stack}
                </pre>
              </div>
            </div>
          )}

          {/* Common Solutions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Common Solutions</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Try generating again with a different image</li>
              <li>Check that your input image is clear and high quality</li>
              <li>Ensure the product is clearly visible in the image</li>
              <li>If the issue persists, contact support with the Request ID above</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Error Details
                </>
              )}
            </Button>

            <Button
              variant="default"
              size="sm"
              asChild
            >
              <a href="/app/help">
                Contact Support
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

