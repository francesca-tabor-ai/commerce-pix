// TypeScript types for the generation_jobs table
export type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export type GenerationJob = {
  id: string
  user_id: string
  project_id: string
  status: JobStatus
  mode: string
  input_asset_id: string | null
  error: string | null
  cost_cents: number
  created_at: string
  updated_at: string
}

export type NewGenerationJob = {
  project_id: string
  mode: string
  input_asset_id?: string | null
  cost_cents?: number
}

export type UpdateGenerationJob = {
  status?: JobStatus
  error?: string | null
  cost_cents?: number
}

export type JobStatistic = {
  status: JobStatus
  count: number
  total_cost_cents: number
  avg_cost_cents: number
}

export type JobSummary = {
  user_id: string
  project_id: string
  status: JobStatus
  job_count: number
  total_cost_cents: number
  avg_cost_cents: number
  first_job_at: string
  last_job_at: string
}

export type RecentJob = {
  id: string
  project_id: string
  status: JobStatus
  mode: string
  cost_cents: number
  created_at: string
}

