'use client'

import { useState, useEffect } from 'react'
import { getProjectJobsClient, createGenerationJobClient, updateGenerationJobClient, deleteGenerationJobClient, transitionJobStatusClient, getJobStatisticsClient, getTotalCostsClient } from '@/lib/db/generation-jobs-client'
import { getProjectsClient } from '@/lib/db/projects-client'
import type { GenerationJob, JobStatus, JobStatistic } from '@/lib/db/job-types'
import type { Project } from '@/lib/db/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function GenerationJobsTestClient() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [jobs, setJobs] = useState<GenerationJob[]>([])
  const [statistics, setStatistics] = useState<JobStatistic[]>([])
  const [totalCosts, setTotalCosts] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [mode, setMode] = useState('main_white')
  const [inputAssetId, setInputAssetId] = useState('')
  const [costCents, setCostCents] = useState('100')

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  // Load jobs when project changes
  useEffect(() => {
    if (selectedProjectId) {
      loadJobs()
    }
  }, [selectedProjectId])

  // Load statistics
  useEffect(() => {
    loadStatistics()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await getProjectsClient()
      setProjects(data)
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const loadJobs = async () => {
    if (!selectedProjectId) return
    
    try {
      setError(null)
      const data = await getProjectJobsClient(selectedProjectId)
      setJobs(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load jobs')
    }
  }

  const loadStatistics = async () => {
    try {
      const [stats, costs] = await Promise.all([
        getJobStatisticsClient(),
        getTotalCostsClient()
      ])
      setStatistics(stats)
      setTotalCosts(costs)
    } catch (err: any) {
      console.error('Failed to load statistics:', err)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProjectId) {
      setError('Please select a project first')
      return
    }

    try {
      setError(null)
      await createGenerationJobClient({
        project_id: selectedProjectId,
        mode,
        input_asset_id: inputAssetId || null,
        cost_cents: parseInt(costCents) || 0,
      })
      
      // Reset form
      setInputAssetId('')
      setCostCents('100')
      
      await loadJobs()
      await loadStatistics()
    } catch (err: any) {
      setError(err.message || 'Failed to create job')
    }
  }

  const handleTransitionStatus = async (jobId: string, newStatus: JobStatus, errorMsg?: string) => {
    try {
      setError(null)
      const success = await transitionJobStatusClient(jobId, newStatus, errorMsg)
      if (success) {
        await loadJobs()
        await loadStatistics()
      } else {
        setError('Failed to transition job status')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to transition status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      setError(null)
      await deleteGenerationJobClient(id)
      await loadJobs()
      await loadStatistics()
    } catch (err: any) {
      setError(err.message || 'Failed to delete job')
    }
  }

  const getStatusBadgeClass = (status: JobStatus) => {
    switch (status) {
      case 'queued':
        return 'bg-gray-100 text-gray-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'succeeded':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Projects Found</CardTitle>
          <CardDescription>
            You need to create a project first before creating generation jobs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/projects-test" className="text-primary hover:underline">
            Go to Projects Test Page →
          </a>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statistics.map((stat) => (
          <Card key={stat.status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.status.charAt(0).toUpperCase() + stat.status.slice(1)} Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                ${(stat.total_cost_cents / 100).toFixed(2)} total
              </p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalCosts / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">All jobs</p>
          </CardContent>
        </Card>
      </div>

      {/* Project selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Project</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Create new job form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Generation Job</CardTitle>
          <CardDescription>Queue a new AI generation task</CardDescription>
        </CardHeader>
        <form onSubmit={handleCreate}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <select
                  id="mode"
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="main_white">Main White</option>
                  <option value="lifestyle">Lifestyle</option>
                  <option value="feature_callout">Feature Callout</option>
                  <option value="packaging">Packaging</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Cost (cents)</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="100"
                  value={costCents}
                  onChange={(e) => setCostCents(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="input-asset">Input Asset ID (optional)</Label>
              <Input
                id="input-asset"
                placeholder="Enter asset ID"
                value={inputAssetId}
                onChange={(e) => setInputAssetId(e.target.value)}
              />
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit">Create Job</Button>
          </CardFooter>
        </form>
      </Card>

      {/* Error display */}
      {error && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/30">
          {error}
        </div>
      )}

      {/* Jobs list */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Jobs</CardTitle>
          <CardDescription>
            {jobs.length === 0 ? 'No jobs yet' : `${jobs.length} job${jobs.length === 1 ? '' : 's'}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Create your first generation job to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeClass(job.status)}`}>
                          {job.status}
                        </span>
                        <span className="text-sm font-medium">{job.mode}</span>
                        <span className="text-xs text-muted-foreground">
                          ${(job.cost_cents / 100).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(job.created_at).toLocaleString()}
                      </p>
                      {job.error && (
                        <p className="text-xs text-destructive mt-2">
                          Error: {job.error}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      {job.status === 'queued' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTransitionStatus(job.id, 'running')}
                        >
                          Start
                        </Button>
                      )}
                      {job.status === 'running' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTransitionStatus(job.id, 'succeeded')}
                          >
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTransitionStatus(job.id, 'failed', 'Test error')}
                          >
                            Fail
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(job.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Show details
                    </summary>
                    <div className="mt-2 p-2 bg-muted rounded font-mono space-y-1">
                      <div><strong>ID:</strong> {job.id}</div>
                      <div><strong>Project ID:</strong> {job.project_id}</div>
                      {job.input_asset_id && (
                        <div><strong>Input Asset:</strong> {job.input_asset_id}</div>
                      )}
                      <div><strong>Updated:</strong> {new Date(job.updated_at).toLocaleString()}</div>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

