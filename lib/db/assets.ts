import { createClient } from '@/lib/supabase/server'
import type { Asset, NewAsset, UpdateAsset, AssetStatistic } from './asset-types'

// Server-side functions (for Server Components and Server Actions)

/**
 * Get all assets for a specific project
 */
export async function getAssetsByProject(projectId: string): Promise<Asset[] | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching assets by project:', error)
    return null
  }
  
  return data as Asset[]
}

/**
 * Get all assets for the current user
 */
export async function getAssets(): Promise<Asset[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching assets:', error)
    throw error
  }
  
  return data || []
}

/**
 * Get assets for a specific project
 */
export async function getProjectAssets(projectId: string): Promise<Asset[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching project assets:', error)
    throw error
  }
  
  return data || []
}

/**
 * Get assets by kind (input or output)
 */
export async function getAssetsByKind(projectId: string, kind: 'input' | 'output'): Promise<Asset[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('project_id', projectId)
    .eq('kind', kind)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching assets by kind:', error)
    throw error
  }
  
  return data || []
}

/**
 * Get output assets derived from a source input asset
 */
export async function getDerivedAssets(sourceAssetId: string): Promise<Asset[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('source_asset_id', sourceAssetId)
    .eq('kind', 'output')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching derived assets:', error)
    throw error
  }
  
  return data || []
}

/**
 * Get a single asset by ID
 */
export async function getAsset(id: string): Promise<Asset | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching asset:', error)
    return null
  }
  
  return data
}

/**
 * Create a new asset
 */
export async function createAsset(asset: NewAsset): Promise<Asset | null> {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User must be authenticated to create an asset')
  }
  
  const { data, error } = await supabase
    .from('assets')
    .insert({
      ...asset,
      user_id: user.id,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating asset:', error)
    throw error
  }
  
  return data
}

/**
 * Update an existing asset
 */
export async function updateAsset(id: string, updates: UpdateAsset): Promise<Asset | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('assets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating asset:', error)
    throw error
  }
  
  return data
}

/**
 * Delete an asset
 */
export async function deleteAsset(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting asset:', error)
    return false
  }
  
  return true
}

/**
 * Get asset statistics
 */
export async function getAssetStatistics(): Promise<AssetStatistic[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('asset_statistics')
    .select('*')
  
  if (error) {
    console.error('Error fetching asset statistics:', error)
    throw error
  }
  
  return data || []
}

