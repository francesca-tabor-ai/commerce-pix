// TypeScript types for the assets table
export type AssetKind = 'input' | 'output'
export type AssetMode = 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging'

export type Asset = {
  id: string
  user_id: string
  project_id: string
  kind: AssetKind
  mode: AssetMode
  source_asset_id: string | null
  prompt_version: string
  prompt_payload: Record<string, any>
  width: number | null
  height: number | null
  mime_type: string | null
  storage_path: string
  created_at: string
  updated_at: string
}

export type NewAsset = {
  project_id: string
  kind: AssetKind
  mode: AssetMode
  source_asset_id?: string | null
  prompt_version: string
  prompt_payload: Record<string, any>
  width?: number | null
  height?: number | null
  mime_type?: string | null
  storage_path: string
}

export type UpdateAsset = {
  kind?: AssetKind
  mode?: AssetMode
  source_asset_id?: string | null
  prompt_version?: string
  prompt_payload?: Record<string, any>
  width?: number | null
  height?: number | null
  mime_type?: string | null
  storage_path?: string
}

export type AssetStatistic = {
  user_id: string
  project_id: string
  kind: AssetKind
  mode: AssetMode
  asset_count: number
  last_created: string
}

