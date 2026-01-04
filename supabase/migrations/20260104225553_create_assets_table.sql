-- Create assets table
-- This migration creates the assets table with complex relationships and constraints

-- Create the assets table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('input', 'output')),
    mode TEXT NOT NULL CHECK (mode IN ('main_white', 'lifestyle', 'feature_callout', 'packaging')),
    source_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    prompt_version TEXT NOT NULL,
    prompt_payload JSONB NOT NULL,
    width INTEGER,
    height INTEGER,
    mime_type TEXT,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_project_id ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_assets_source_asset_id ON assets(source_asset_id);
CREATE INDEX IF NOT EXISTS idx_assets_kind ON assets(kind);
CREATE INDEX IF NOT EXISTS idx_assets_mode ON assets(mode);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);

-- Create a GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_assets_prompt_payload ON assets USING GIN (prompt_payload);

-- Enable Row Level Security
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy: Users can view their own assets
CREATE POLICY "Users can view own assets"
    ON assets
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own assets
CREATE POLICY "Users can insert own assets"
    ON assets
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own assets
CREATE POLICY "Users can update own assets"
    ON assets
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own assets
CREATE POLICY "Users can delete own assets"
    ON assets
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns
COMMENT ON TABLE assets IS 'User assets with input/output tracking and complex metadata';
COMMENT ON COLUMN assets.id IS 'Unique identifier for the asset';
COMMENT ON COLUMN assets.user_id IS 'Reference to the user who owns this asset';
COMMENT ON COLUMN assets.project_id IS 'Reference to the project this asset belongs to';
COMMENT ON COLUMN assets.kind IS 'Type of asset: input or output';
COMMENT ON COLUMN assets.mode IS 'Mode of the asset: main_white, lifestyle, feature_callout, or packaging';
COMMENT ON COLUMN assets.source_asset_id IS 'Reference to the source asset (for outputs derived from an input)';
COMMENT ON COLUMN assets.prompt_version IS 'Version of the prompt used (e.g., v1, v2)';
COMMENT ON COLUMN assets.prompt_payload IS 'Structured parameters stored as JSONB';
COMMENT ON COLUMN assets.width IS 'Width of the asset in pixels';
COMMENT ON COLUMN assets.height IS 'Height of the asset in pixels';
COMMENT ON COLUMN assets.mime_type IS 'MIME type of the asset (e.g., image/png)';
COMMENT ON COLUMN assets.storage_path IS 'Path to the asset in storage';
COMMENT ON COLUMN assets.created_at IS 'Timestamp when the asset was created';
COMMENT ON COLUMN assets.updated_at IS 'Timestamp when the asset was last updated';

-- Create a helper function to get asset dimensions
CREATE OR REPLACE FUNCTION get_asset_dimensions(asset_id UUID)
RETURNS TABLE (width INTEGER, height INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT a.width, a.height
    FROM assets a
    WHERE a.id = asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a helper function to get all outputs derived from an input
CREATE OR REPLACE FUNCTION get_derived_assets(input_asset_id UUID)
RETURNS TABLE (
    id UUID,
    kind TEXT,
    mode TEXT,
    storage_path TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.kind, a.mode, a.storage_path, a.created_at
    FROM assets a
    WHERE a.source_asset_id = input_asset_id
    AND a.kind = 'output'
    ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for asset statistics
CREATE OR REPLACE VIEW asset_statistics AS
SELECT 
    user_id,
    project_id,
    kind,
    mode,
    COUNT(*) as asset_count,
    MAX(created_at) as last_created
FROM assets
GROUP BY user_id, project_id, kind, mode;

COMMENT ON VIEW asset_statistics IS 'Statistics about assets grouped by user, project, kind, and mode';

