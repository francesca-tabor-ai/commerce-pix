'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

interface Job {
  id: string
  status: JobStatus
  mode: string
  error?: string | null
  cost_cents: number
  created_at: string
  updated_at: string
}

interface GenerationProgressProps {
  jobId: string
  onComplete: () => void
  onDismiss: () => void
}

export default function GenerationProgress({ jobId, onComplete, onDismiss }: GenerationProgressProps) {
  const [job, setJob] = useState<Job | null>(null)
  const [polling, setPolling] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    const pollJobStatus = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`)
        const data = await response.json()

        if (response.ok && data.job) {
          setJob(data.job)

          // Stop polling if job is done
          if (data.job.status === 'succeeded' || data.job.status === 'failed') {
            setPolling(false)
            if (intervalId) {
              clearInterval(intervalId)
            }
            
            // Call onComplete after a brief delay to show final status
            if (data.job.status === 'succeeded') {
              setTimeout(() => {
                onComplete()
              }, 2000)
            }
          }
        } else {
          setError(data.error || 'Failed to fetch job status')
          setPolling(false)
          if (intervalId) {
            clearInterval(intervalId)
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch job status')
        setPolling(false)
        if (intervalId) {
          clearInterval(intervalId)
        }
      }
    }

    // Initial poll
    pollJobStatus()

    // Set up polling interval (every 2 seconds)
    if (polling) {
      intervalId = setInterval(pollJobStatus, 2000)
    }

    // Cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [jobId, polling, onComplete])

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <XCircle className="h-5 w-5 mr-2" />
            Error Checking Job Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={onDismiss} variant="outline" size="sm">
            Dismiss
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading job status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = () => {
    switch (job.status) {
      case 'queued':
        return <Clock className="h-5 w-5 text-muted-foreground" />
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />
      case 'succeeded':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />
    }
  }

  const getStatusText = () => {
    switch (job.status) {
      case 'queued':
        return 'Queued'
      case 'running':
        return 'Generating...'
      case 'succeeded':
        return 'Complete!'
      case 'failed':
        return 'Failed'
    }
  }

  const getStatusColor = () => {
    switch (job.status) {
      case 'queued':
        return 'border-muted'
      case 'running':
        return 'border-primary'
      case 'succeeded':
        return 'border-green-600'
      case 'failed':
        return 'border-destructive'
    }
  }

  return (
    <Card className={getStatusColor()}>
      <CardHeader>
        <CardTitle className="flex items-center">
          {getStatusIcon()}
          <span className="ml-2">{getStatusText()}</span>
        </CardTitle>
        <CardDescription>
          Job ID: {job.id.slice(0, 8)}... • Mode: {job.mode}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status details */}
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium capitalize">{job.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Started:</span>
            <span className="font-medium">
              {new Date(job.created_at).toLocaleTimeString()}
            </span>
          </div>
          {job.status === 'succeeded' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cost:</span>
              <span className="font-medium">${(job.cost_cents / 100).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Error message */}
        {job.status === 'failed' && job.error && (
          <div className="p-3 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive">{job.error}</p>
          </div>
        )}

        {/* Success message */}
        {job.status === 'succeeded' && (
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Image generated successfully! The gallery will refresh automatically.
            </p>
          </div>
        )}

        {/* Progress indicator */}
        {(job.status === 'queued' || job.status === 'running') && (
          <div className="space-y-2">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: job.status === 'queued' ? '30%' : '70%' }} />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {job.status === 'queued' ? 'Preparing...' : 'Generating with AI...'}
            </p>
          </div>
        )}

        {/* Dismiss button */}
        {(job.status === 'succeeded' || job.status === 'failed') && (
          <Button onClick={onDismiss} variant="outline" size="sm" className="w-full">
            Dismiss
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

