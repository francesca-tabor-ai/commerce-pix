import 'server-only'
import { createClient } from '@/lib/supabase/server'

export interface AdminStats {
  totalUsers: number
  totalGenerations: number
  planDistribution: Array<{
    planName: string
    userCount: number
    percentage: number
  }>
}

export interface GenerationJobSummary {
  id: string
  user_email: string | null
  status: string
  mode: string
  created_at: string
  completed_at: string | null
  error_message: string | null
  project_name: string | null
}

/**
 * Get total number of users
 */
export async function getTotalUsers(): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error fetching total users:', error)
    return 0
  }

  return count || 0
}

/**
 * Get total number of generations (output assets)
 */
export async function getTotalGenerations(): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .eq('kind', 'output')

  if (error) {
    console.error('Error fetching total generations:', error)
    return 0
  }

  return count || 0
}

/**
 * Get plan distribution (how many users on each plan)
 */
export async function getPlanDistribution(): Promise<AdminStats['planDistribution']> {
  const supabase = await createClient()

  // Get all plans
  const { data: plans, error: plansError } = await supabase
    .from('plans')
    .select('id, name')
    .order('monthly_price_cents', { ascending: true })

  if (plansError) {
    console.error('Error fetching plans:', plansError)
    return []
  }

  // Get subscription counts per plan
  const { data: subscriptions, error: subsError } = await supabase
    .from('subscriptions')
    .select('plan_id, status')
    .in('status', ['active', 'trialing', 'past_due'])

  if (subsError) {
    console.error('Error fetching subscriptions:', subsError)
    return []
  }

  // Count users per plan
  const planCounts = new Map<string, number>()
  subscriptions?.forEach((sub) => {
    const current = planCounts.get(sub.plan_id) || 0
    planCounts.set(sub.plan_id, current + 1)
  })

  const totalActiveUsers = subscriptions?.length || 0

  // Build distribution
  const distribution = plans.map((plan) => {
    const userCount = planCounts.get(plan.id) || 0
    const percentage = totalActiveUsers > 0 ? (userCount / totalActiveUsers) * 100 : 0

    return {
      planName: plan.name,
      userCount,
      percentage: Math.round(percentage * 10) / 10,
    }
  })

  // Add "No Plan" for users without subscriptions
  const totalUsers = await getTotalUsers()
  const usersWithoutPlan = totalUsers - totalActiveUsers
  if (usersWithoutPlan > 0) {
    distribution.push({
      planName: 'No Plan',
      userCount: usersWithoutPlan,
      percentage: Math.round((usersWithoutPlan / totalUsers) * 100 * 10) / 10,
    })
  }

  return distribution
}

/**
 * Get last N generation jobs with details
 */
export async function getRecentGenerationJobs(limit: number = 20): Promise<GenerationJobSummary[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('generation_jobs')
    .select(`
      id,
      status,
      mode,
      created_at,
      completed_at,
      error_message,
      user_id,
      project_id
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching generation jobs:', error)
    return []
  }

  if (!data) return []

  // Fetch user emails and project names
  const userIds = [...new Set(data.map((job) => job.user_id).filter(Boolean))]
  const projectIds = [...new Set(data.map((job) => job.project_id).filter(Boolean))]

  const [usersResult, projectsResult] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('projects').select('id, name').in('id', projectIds),
  ])

  const userEmailMap = new Map<string, string>()
  usersResult.data.users.forEach((user) => {
    if (user.id && user.email) {
      userEmailMap.set(user.id, user.email)
    }
  })

  const projectNameMap = new Map<string, string>()
  projectsResult.data?.forEach((project) => {
    projectNameMap.set(project.id, project.name)
  })

  // Map jobs with user emails and project names
  return data.map((job) => ({
    id: job.id,
    user_email: job.user_id ? userEmailMap.get(job.user_id) || null : null,
    status: job.status,
    mode: job.mode,
    created_at: job.created_at,
    completed_at: job.completed_at,
    error_message: job.error_message,
    project_name: job.project_id ? projectNameMap.get(job.project_id) || null : null,
  }))
}

/**
 * Get all admin stats at once
 */
export async function getAdminStats(): Promise<AdminStats> {
  const [totalUsers, totalGenerations, planDistribution] = await Promise.all([
    getTotalUsers(),
    getTotalGenerations(),
    getPlanDistribution(),
  ])

  return {
    totalUsers,
    totalGenerations,
    planDistribution,
  }
}

