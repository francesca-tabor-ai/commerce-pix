'use server'

import { requireUser } from '@/lib/supabase/server'
import { createProject, updateProject, deleteProject } from '@/lib/db/projects'
import { revalidatePath } from 'next/cache'

/**
 * Create a new project
 */
export async function createProjectAction(name: string): Promise<{ 
  success: boolean
  projectId?: string
  error?: string 
}> {
  try {
    await requireUser()

    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: 'Project name is required'
      }
    }

    if (name.trim().length > 100) {
      return {
        success: false,
        error: 'Project name must be less than 100 characters'
      }
    }

    const project = await createProject({ name: name.trim() })

    if (!project) {
      return {
        success: false,
        error: 'Failed to create project'
      }
    }

    // Revalidate projects pages
    revalidatePath('/app/projects')
    revalidatePath('/app')

    return {
      success: true,
      projectId: project.id
    }
  } catch (error) {
    console.error('Error in createProjectAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Rename a project
 */
export async function renameProjectAction(
  projectId: string,
  newName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireUser()

    if (!newName || newName.trim().length === 0) {
      return {
        success: false,
        error: 'Project name is required'
      }
    }

    if (newName.trim().length > 100) {
      return {
        success: false,
        error: 'Project name must be less than 100 characters'
      }
    }

    const project = await updateProject(projectId, { name: newName.trim() })

    if (!project) {
      return {
        success: false,
        error: 'Failed to rename project'
      }
    }

    // Revalidate projects pages
    revalidatePath('/app/projects')
    revalidatePath(`/app/projects/${projectId}`)
    revalidatePath('/app')

    return { success: true }
  } catch (error) {
    console.error('Error in renameProjectAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Delete a project
 */
export async function deleteProjectAction(
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireUser()

    const success = await deleteProject(projectId)

    if (!success) {
      return {
        success: false,
        error: 'Failed to delete project'
      }
    }

    // Revalidate projects pages
    revalidatePath('/app/projects')
    revalidatePath('/app')

    return { success: true }
  } catch (error) {
    console.error('Error in deleteProjectAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

