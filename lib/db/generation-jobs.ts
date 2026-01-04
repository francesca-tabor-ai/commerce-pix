import { createClient } from '@/lib/supabase/server'
import type { GenerationJob, NewGenerationJob, UpdateGenerationJob, JobStatistic, JobSummary, RecentJob, JobStatus } from './job-types'

// Server-side functions (for Server Components and Server Actions)

/**
 * Get all generation jobs for the current user
 */
export async function getGenerationJobs(): Promise<GenerationJob[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching generation jobs:', error)
    throw error
  }
  
  return data || []
}

/**
 * Get generation jobs for a specific project
 */
export async function getProjectJobs(projectId: string): Promise<GenerationJob[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching project jobs:', error)
    throw error
  }
  
  return data || []
}

/**
 * Get jobs by status
 */
export async function getJobsByStatus(status: JobStatus): Promise<GenerationJob[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching jobs by status:', error)
    throw error
  }
  
  return data || []
}

/**
 * Get a single generation job by ID
 */
export async function getGenerationJob(id: string): Promise<GenerationJob | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching generation job:', error)
    return null
  }
  
  return data
}

/**
 * Create a new generation job
 */
export async function createGenerationJob(job: NewGenerationJob): Promise<GenerationJob | null> {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated to create a generation job')
  }
  
  const { data, error } = await supabase
    .from('generation_jobs')
    .insert({
      ...job,
      user_id: user.id,
      status: 'queued',
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating generation job:', error)
    throw error
  }
  
  return data
}

/**
 * Update an existing generation job
 */
export async function updateGenerationJob(id: string, updates: UpdateGenerationJob): Promise<GenerationJob | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generation_jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating generation job:', error)
    throw error
  }
  
  return data
}

/**
 * Transition job status with validation
 */
export async function transitionJobStatus(
  jobId: string,
  newStatus: JobStatus,
  errorMessage?: string
): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('transition_job_status', {
    p_job_id: jobId,
    p_new_status: newStatus,
    p_error: errorMessage || null,
  })
  
  if (error) {
    console.error('Error transitioning job status:', error)
    return false
  }
  
  return data === true
}

/**
 * Delete a generation job
 */
export async function deleteGenerationJob(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('generation_jobs')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting generation job:', error)
    return false
  }
  
  return true
}

/**
 * Get job statistics for the current user
 */
export async function getJobStatistics(): Promise<JobStatistic[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_job_statistics')
  
  if (error) {
    console.error('Error fetching job statistics:', error)
    throw error
  }
  
  return data || []
}

/**
 * Get recent jobs
 */
export async function getRecentJobs(limit: number = 10): Promise<RecentJob[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_recent_jobs', {
    p_limit: limit,
  })
  
  if (error) {
    console.error('Error fetching recent jobs:', error)
    throw error
  }
  
  return data || []
}

/**
 * Get job summary by project
 */
export async function getJobSummary(): Promise<JobSummary[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generation_job_summary')
    .select('*')
  
  if (error) {
    console.error('Error fetching job summary:', error)
    throw error
  }
  
  return data || []
}

/**
 * Calculate total costs for a user
 */
export async function getTotalCosts(): Promise<number> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('cost_cents')
  
  if (error) {
    console.error('Error calculating total costs:', error)
    return 0
  }
  
  return data.reduce((sum, job) => sum + (job.cost_cents || 0), 0)
}

