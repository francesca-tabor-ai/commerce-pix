import { createClient } from '@/lib/supabase/server'
import type { Project, NewProject, UpdateProject } from './types'

// Server-side functions (for Server Components and Server Actions)

/**
 * Get all projects for the current user
 */
export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient()
  
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
 * Get a single project by ID
 */
export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching project:', error)
    return null
  }
  
  return data
}

/**
 * Create a new project
 */
export async function createProject(project: NewProject): Promise<Project | null> {
  const supabase = await createClient()
  
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
 * Update an existing project
 */
export async function updateProject(id: string, updates: UpdateProject): Promise<Project | null> {
  const supabase = await createClient()
  
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
 * Delete a project
 */
export async function deleteProject(id: string): Promise<boolean> {
  const supabase = await createClient()
  
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

