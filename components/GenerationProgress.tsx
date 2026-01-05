'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ErrorDetailsDialog } from './ErrorDetailsDialog'

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
        return 'Queued for Processing'
      case 'running':
        return 'AI is Creating Your Image'
      case 'succeeded':
        return 'Generation Complete!'
      case 'failed':
        return 'Generation Failed'
    }
  }

  const getProgressMessage = () => {
    switch (job.status) {
      case 'queued':
        return 'Your request is in the queue. Starting soon...'
      case 'running':
        return 'Building your Amazon-compliant product image with AI...'
      case 'succeeded':
        return 'Your image is ready! Gallery will update automatically.'
      case 'failed':
        return job.error || 'Something went wrong. Please try again.'
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
          <div className="space-y-3">
            <div className="p-3 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive font-medium mb-2">
                Job failed — Something went wrong during generation
              </p>
              <ErrorDetailsDialog
                error={job.error}
                jobId={job.id}
                trigger={
                  <Button variant="outline" size="sm" className="w-full">
                    View Error Details
                  </Button>
                }
              />
            </div>
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

        {/* Progress message */}
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground text-center">
            {getProgressMessage()}
          </p>
        </div>

        {/* Progress indicator */}
        {(job.status === 'queued' || job.status === 'running') && (
          <div className="space-y-2">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-1000" 
                   style={{ 
                     width: job.status === 'queued' ? '30%' : '70%',
                     animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                   }} />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {job.status === 'queued' && '⏱️ Step 1: Preparing your request...'}
              {job.status === 'running' && '✨ Step 2: AI is generating your image...'}
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

