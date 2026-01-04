# Assets Table Implementation

## ✅ Overview

The `assets` table provides a sophisticated system for managing input and output assets with complex relationships, metadata, and lineage tracking.

## 📊 Schema

### Table: `assets`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `user_id` | UUID | NOT NULL, FK → auth.users ON DELETE CASCADE | Owner of the asset |
| `project_id` | UUID | NOT NULL, FK → projects ON DELETE CASCADE | Parent project |
| `kind` | TEXT | NOT NULL, CHECK ('input', 'output') | Asset type |
| `mode` | TEXT | NOT NULL, CHECK ('main_white', 'lifestyle', 'feature_callout', 'packaging') | Asset mode |
| `source_asset_id` | UUID | NULLABLE, FK → assets(id) ON DELETE SET NULL | Source input for outputs |
| `prompt_version` | TEXT | NOT NULL | Prompt version (e.g., 'v1', 'v2') |
| `prompt_payload` | JSONB | NOT NULL | Structured prompt parameters |
| `width` | INTEGER | NULLABLE | Asset width in pixels |
| `height` | INTEGER | NULLABLE | Asset height in pixels |
| `mime_type` | TEXT | NULLABLE | MIME type (e.g., 'image/png') |
| `storage_path` | TEXT | NOT NULL | Path to asset in storage |
| `created_at` | TIMESTAMPTZ | DEFAULT now() NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() NOT NULL | Last update timestamp |

### Enum Values

**kind:**
- `input` - Source/input asset
- `output` - Generated/output asset

**mode:**
- `main_white` - Main product on white background
- `lifestyle` - Lifestyle/contextual imagery
- `feature_callout` - Feature highlights
- `packaging` - Packaging mockups

## 🔒 Security & Constraints

### Row Level Security (RLS)

All operations filtered by `auth.uid() = user_id`:
- ✅ Users can SELECT only their assets
- ✅ Users can INSERT only for themselves
- ✅ Users can UPDATE only their assets
- ✅ Users can DELETE only their assets

### Foreign Key Constraints

```sql
user_id → auth.users(id) ON DELETE CASCADE
project_id → projects(id) ON DELETE CASCADE  
source_asset_id → assets(id) ON DELETE SET NULL
```

**Behavior:**
- Deleting a user deletes all their assets
- Deleting a project deletes all its assets
- Deleting a source asset sets `source_asset_id` to NULL

### Check Constraints

```sql
kind IN ('input', 'output')
mode IN ('main_white', 'lifestyle', 'feature_callout', 'packaging')
```

## ⚡ Performance

### Indexes

```sql
-- B-tree indexes for standard queries
idx_assets_user_id ON assets(user_id)
idx_assets_project_id ON assets(project_id)
idx_assets_source_asset_id ON assets(source_asset_id)
idx_assets_kind ON assets(kind)
idx_assets_mode ON assets(mode)
idx_assets_created_at ON assets(created_at DESC)

-- GIN index for JSONB queries
idx_assets_prompt_payload ON assets USING GIN (prompt_payload)
```

**Query Optimization:**
- Fast user/project filtering
- Efficient kind/mode lookups
- Quick chronological sorting
- JSONB key-value searches

## 🔧 Helper Functions

### SQL Functions

**get_asset_dimensions(asset_id)**
```sql
SELECT * FROM get_asset_dimensions('asset-uuid');
-- Returns: width, height
```

**get_derived_assets(input_asset_id)**
```sql
SELECT * FROM get_derived_assets('input-uuid');
-- Returns: all output assets derived from input
```

### Views

**asset_statistics**
```sql
SELECT * FROM asset_statistics;
-- Aggregated counts by user, project, kind, mode
```

## 📝 TypeScript API

### Types

```typescript
type AssetKind = 'input' | 'output'
type AssetMode = 'main_white' | 'lifestyle' | 'feature_callout' | 'packaging'

type Asset = {
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
```

### Server Functions (lib/db/assets.ts)

```typescript
getAssets()                           // Get all user's assets
getProjectAssets(projectId)           // Get assets for project
getAssetsByKind(projectId, kind)      // Filter by input/output
getDerivedAssets(sourceAssetId)       // Get outputs from input
getAsset(id)                          // Get single asset
createAsset(data)                     // Create new asset
updateAsset(id, updates)              // Update asset
deleteAsset(id)                       // Delete asset
getAssetStatistics()                  // Get aggregated stats
```

### Client Functions (lib/db/assets-client.ts)

Same API with `Client` suffix for use in client components.

## 💡 Usage Examples

### Creating an Input Asset

```typescript
import { createAsset } from '@/lib/db/assets'

const inputAsset = await createAsset({
  project_id: 'project-uuid',
  kind: 'input',
  mode: 'main_white',
  prompt_version: 'v1',
  prompt_payload: {
    style: 'modern',
    background: 'white',
    lighting: 'soft'
  },
  width: 1024,
  height: 768,
  mime_type: 'image/png',
  storage_path: '/uploads/input-123.png'
})
```

### Creating an Output Derived from Input

```typescript
const outputAsset = await createAsset({
  project_id: 'project-uuid',
  kind: 'output',
  mode: 'lifestyle',
  source_asset_id: inputAsset.id,  // Link to input
  prompt_version: 'v1',
  prompt_payload: {
    scene: 'kitchen',
    lighting: 'natural',
    processed: true
  },
  width: 2048,
  height: 1536,
  mime_type: 'image/jpeg',
  storage_path: '/outputs/lifestyle-456.jpg'
})
```

### Querying Assets

```typescript
// Get all inputs for a project
const inputs = await getAssetsByKind(projectId, 'input')

// Get all outputs derived from an input
const outputs = await getDerivedAssets(inputAsset.id)

// Query JSONB payload
const supabase = await createClient()
const { data } = await supabase
  .from('assets')
  .select('*')
  .contains('prompt_payload', { style: 'modern' })
```

## 🎯 Use Cases

### 1. Asset Lineage Tracking

Track which outputs were generated from which inputs:

```
Input Asset (main_white)
├─ Output Asset (lifestyle)
├─ Output Asset (feature_callout)
└─ Output Asset (packaging)
```

### 2. Prompt Versioning

Store different prompt versions and their parameters:

```typescript
prompt_version: 'v2'
prompt_payload: {
  model: 'gpt-4',
  temperature: 0.7,
  parameters: {...}
}
```

### 3. Multi-Mode Workflows

Generate multiple modes from a single input:

```typescript
// Input: Product photo
// Outputs:
//   - main_white: Product on white background
//   - lifestyle: Product in use
//   - feature_callout: With annotations
//   - packaging: Mockup on packaging
```

## 🧪 Testing

Visit: http://localhost:3001/assets-test

**Test Features:**
1. Select a project
2. Create input assets
3. Create output assets linked to inputs
4. View derived assets
5. Delete assets
6. Verify RLS isolation

## 📋 Migration Application

### Step 1: Apply Migration

```sql
-- Copy from: supabase/migrations/20260104225553_create_assets_table.sql
-- Run in Supabase SQL Editor
```

### Step 2: Verify

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'assets'
ORDER BY ordinal_position;

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'assets';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'assets';
```

## 🔄 Relationship Diagram

```
┌──────────────┐
│  auth.users  │
└──────┬───────┘
       │ CASCADE
       │
┌──────▼───────┐
│   projects   │
└──────┬───────┘
       │ CASCADE
       │
┌──────▼───────────────────────┐
│          assets              │
├──────────────────────────────┤
│ id (PK)                      │
│ user_id (FK → auth.users)    │
│ project_id (FK → projects)   │
│ source_asset_id (FK → self)  │◄── Self-referential
│ kind (CHECK)                 │    for lineage
│ mode (CHECK)                 │
│ prompt_payload (JSONB)       │
│ ...                          │
└──────────────────────────────┘
```

## ✨ Advanced Features

### JSONB Queries

```sql
-- Find assets with specific prompt parameter
SELECT * FROM assets
WHERE prompt_payload @> '{"style": "modern"}';

-- Extract specific keys
SELECT id, prompt_payload->>'model' as model
FROM assets;

-- Check key existence
SELECT * FROM assets
WHERE prompt_payload ? 'temperature';
```

### Asset Statistics

```sql
-- View aggregated statistics
SELECT * FROM asset_statistics
WHERE user_id = auth.uid()
ORDER BY asset_count DESC;
```

### Cascade Behavior

```sql
-- Delete user → deletes all assets
DELETE FROM auth.users WHERE id = 'user-uuid';

-- Delete project → deletes all project assets
DELETE FROM projects WHERE id = 'project-uuid';

-- Delete input → sets source_asset_id to NULL in outputs
DELETE FROM assets WHERE id = 'input-uuid';
```

## 🚀 Production Considerations

1. **Storage Integration**: `storage_path` should reference actual cloud storage (S3, Supabase Storage)
2. **JSONB Size**: Monitor `prompt_payload` size for performance
3. **Cascade Deletes**: Ensure proper cleanup in application logic
4. **Indexes**: Add custom indexes based on query patterns
5. **Backups**: Regular backups for JSONB data
6. **Versioning**: Use `prompt_version` for backward compatibility

---

**Status:** Schema ready ✅ | Helper functions complete ✅ | Test page working ✅

