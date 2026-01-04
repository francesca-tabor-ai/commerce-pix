import { createClient } from '@/lib/supabase/client'
import type { Project, NewProject, UpdateProject } from './types'

/**
 * Client-side: Get all projects for the current user
 */
export async function getProjectsClient(): Promise<Project[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
  
  return data || []
}

/**
 * Client-side: Create a new project
 */
export async function createProjectClient(project: NewProject): Promise<Project | null> {
  const supabase = createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated to create a project')
  }
  
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: project.name,
      user_id: user.id,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating project:', error)
    throw error
  }
  
  return data
}

/**
 * Client-side: Update a project
 */
export async function updateProjectClient(id: string, updates: UpdateProject): Promise<Project | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating project:', error)
    throw error
  }
  
  return data
}

/**
 * Client-side: Delete a project
 */
export async function deleteProjectClient(id: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting project:', error)
    return false
  }
  
  return true
}

