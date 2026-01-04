import { createClient } from '@/lib/supabase/client'
import type { Asset, NewAsset, UpdateAsset, AssetStatistic } from './asset-types'

// Client-side functions (for Client Components)

/**
 * Client-side: Get all assets for the current user
 */
export async function getAssetsClient(): Promise<Asset[]> {
  const supabase = createClient()
  
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
 * Client-side: Get assets for a specific project
 */
export async function getProjectAssetsClient(projectId: string): Promise<Asset[]> {
  const supabase = createClient()
  
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
 * Client-side: Get assets by kind (input or output)
 */
export async function getAssetsByKindClient(projectId: string, kind: 'input' | 'output'): Promise<Asset[]> {
  const supabase = createClient()
  
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
 * Client-side: Get output assets derived from a source input asset
 */
export async function getDerivedAssetsClient(sourceAssetId: string): Promise<Asset[]> {
  const supabase = createClient()
  
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
 * Client-side: Create a new asset
 */
export async function createAssetClient(asset: NewAsset): Promise<Asset | null> {
  const supabase = createClient()
  
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
 * Client-side: Update an asset
 */
export async function updateAssetClient(id: string, updates: UpdateAsset): Promise<Asset | null> {
  const supabase = createClient()
  
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
 * Client-side: Delete an asset
 */
export async function deleteAssetClient(id: string): Promise<boolean> {
  const supabase = createClient()
  
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
 * Client-side: Get asset statistics
 */
export async function getAssetStatisticsClient(): Promise<AssetStatistic[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('asset_statistics')
    .select('*')
  
  if (error) {
    console.error('Error fetching asset statistics:', error)
    throw error
  }
  
  return data || []
}

