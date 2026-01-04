import { createClient } from '@/lib/supabase/client'
import type { GenerationJob, NewGenerationJob, UpdateGenerationJob, JobStatistic, JobSummary, RecentJob, JobStatus } from './job-types'

// Client-side functions (for Client Components)

/**
 * Client-side: Get all generation jobs for the current user
 */
export async function getGenerationJobsClient(): Promise<GenerationJob[]> {
  const supabase = createClient()
  
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
 * Client-side: Get generation jobs for a specific project
 */
export async function getProjectJobsClient(projectId: string): Promise<GenerationJob[]> {
  const supabase = createClient()
  
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
 * Client-side: Get jobs by status
 */
export async function getJobsByStatusClient(status: JobStatus): Promise<GenerationJob[]> {
  const supabase = createClient()
  
  const { data, error} = await supabase
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
 * Client-side: Create a new generation job
 */
export async function createGenerationJobClient(job: NewGenerationJob): Promise<GenerationJob | null> {
  const supabase = createClient()
  
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
 * Client-side: Update a generation job
 */
export async function updateGenerationJobClient(id: string, updates: UpdateGenerationJob): Promise<GenerationJob | null> {
  const supabase = createClient()
  
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
 * Client-side: Transition job status with validation
 */
export async function transitionJobStatusClient(
  jobId: string,
  newStatus: JobStatus,
  errorMessage?: string
): Promise<boolean> {
  const supabase = createClient()
  
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
 * Client-side: Delete a generation job
 */
export async function deleteGenerationJobClient(id: string): Promise<boolean> {
  const supabase = createClient()
  
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
 * Client-side: Get job statistics
 */
export async function getJobStatisticsClient(): Promise<JobStatistic[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase.rpc('get_job_statistics')
  
  if (error) {
    console.error('Error fetching job statistics:', error)
    throw error
  }
  
  return data || []
}

/**
 * Client-side: Get recent jobs
 */
export async function getRecentJobsClient(limit: number = 10): Promise<RecentJob[]> {
  const supabase = createClient()
  
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
 * Client-side: Calculate total costs
 */
export async function getTotalCostsClient(): Promise<number> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('cost_cents')
  
  if (error) {
    console.error('Error calculating total costs:', error)
    return 0
  }
  
  return data.reduce((sum, job) => sum + (job.cost_cents || 0), 0)
}

