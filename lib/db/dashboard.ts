import { createClient } from '@/lib/supabase/server'
import { getCreditBalance } from './billing'
import type { Asset } from './asset-types'
import type { Project } from './types'

/**
 * Get dashboard stats for a user
 */
export async function getDashboardStats(userId: string) {
  const supabase = await createClient()

  // Get credits
  const creditBalance = await getCreditBalance(userId)

  // Get images generated this month
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const { count: imagesThisMonth } = await supabase
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .eq('kind', 'output')
    .gte('created_at', firstDayOfMonth.toISOString())
    .limit(1)

  // Get total projects
  const { count: totalProjects } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .limit(1)

  // Get last project (most recently updated)
  const { data: lastProject } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  return {
    creditBalance,
    imagesThisMonth: imagesThisMonth || 0,
    totalProjects: totalProjects || 0,
    lastProject: lastProject as Project | null,
  }
}

/**
 * Get recent output assets across all projects
 */
export async function getRecentOutputs(userId: string, limit: number = 12): Promise<Asset[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('kind', 'output')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent outputs:', error)
    return []
  }

  return (data || []) as Asset[]
}

