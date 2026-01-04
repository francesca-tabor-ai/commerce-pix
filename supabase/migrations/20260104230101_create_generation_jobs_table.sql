-- Create generation_jobs table
-- This migration creates the generation_jobs table for tracking AI generation tasks

-- Create the generation_jobs table
CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed')) DEFAULT 'queued',
    mode TEXT NOT NULL,
    input_asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    error TEXT,
    cost_cents INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_id ON generation_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_project_id ON generation_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_input_asset_id ON generation_jobs(input_asset_id);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_created_at ON generation_jobs(created_at DESC);

-- Create a composite index for common queries (user + status)
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_status ON generation_jobs(user_id, status);

-- Enable Row Level Security
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Policy: Users can view their own jobs
CREATE POLICY "Users can view own generation jobs"
    ON generation_jobs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own jobs
CREATE POLICY "Users can insert own generation jobs"
    ON generation_jobs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own jobs (e.g., status changes)
CREATE POLICY "Users can update own generation jobs"
    ON generation_jobs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own jobs
CREATE POLICY "Users can delete own generation jobs"
    ON generation_jobs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_generation_jobs_updated_at
    BEFORE UPDATE ON generation_jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to the table and columns
COMMENT ON TABLE generation_jobs IS 'AI generation jobs with status tracking and cost management';
COMMENT ON COLUMN generation_jobs.id IS 'Unique identifier for the generation job';
COMMENT ON COLUMN generation_jobs.user_id IS 'Reference to the user who created this job';
COMMENT ON COLUMN generation_jobs.project_id IS 'Reference to the project this job belongs to';
COMMENT ON COLUMN generation_jobs.status IS 'Job status: queued, running, succeeded, or failed';
COMMENT ON COLUMN generation_jobs.mode IS 'Generation mode (e.g., main_white, lifestyle, etc.)';
COMMENT ON COLUMN generation_jobs.input_asset_id IS 'Reference to the input asset used for generation';
COMMENT ON COLUMN generation_jobs.error IS 'Error message if the job failed';
COMMENT ON COLUMN generation_jobs.cost_cents IS 'Cost of the generation in cents';
COMMENT ON COLUMN generation_jobs.created_at IS 'Timestamp when the job was created';
COMMENT ON COLUMN generation_jobs.updated_at IS 'Timestamp when the job was last updated';

-- Create a function to get job statistics
CREATE OR REPLACE FUNCTION get_job_statistics(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    status TEXT,
    count BIGINT,
    total_cost_cents BIGINT,
    avg_cost_cents NUMERIC
) AS $$
BEGIN
    IF p_user_id IS NULL THEN
        p_user_id := auth.uid();
    END IF;
    
    RETURN QUERY
    SELECT 
        j.status,
        COUNT(*) as count,
        SUM(j.cost_cents) as total_cost_cents,
        AVG(j.cost_cents) as avg_cost_cents
    FROM generation_jobs j
    WHERE j.user_id = p_user_id
    GROUP BY j.status
    ORDER BY j.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get recent jobs
CREATE OR REPLACE FUNCTION get_recent_jobs(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    status TEXT,
    mode TEXT,
    cost_cents INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        j.id,
        j.project_id,
        j.status,
        j.mode,
        j.cost_cents,
        j.created_at
    FROM generation_jobs j
    WHERE j.user_id = auth.uid()
    ORDER BY j.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for job summary by project
CREATE OR REPLACE VIEW generation_job_summary AS
SELECT 
    user_id,
    project_id,
    status,
    COUNT(*) as job_count,
    SUM(cost_cents) as total_cost_cents,
    AVG(cost_cents) as avg_cost_cents,
    MIN(created_at) as first_job_at,
    MAX(created_at) as last_job_at
FROM generation_jobs
GROUP BY user_id, project_id, status;

COMMENT ON VIEW generation_job_summary IS 'Summary of generation jobs by project and status';

-- Create a function to transition job status
CREATE OR REPLACE FUNCTION transition_job_status(
    p_job_id UUID,
    p_new_status TEXT,
    p_error TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_status TEXT;
BEGIN
    -- Get current status
    SELECT status INTO v_current_status
    FROM generation_jobs
    WHERE id = p_job_id AND user_id = auth.uid();
    
    IF v_current_status IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Validate status transitions
    IF v_current_status = 'succeeded' OR v_current_status = 'failed' THEN
        -- Cannot transition from terminal states
        RETURN FALSE;
    END IF;
    
    -- Update the job
    UPDATE generation_jobs
    SET 
        status = p_new_status,
        error = p_error,
        updated_at = now()
    WHERE id = p_job_id AND user_id = auth.uid();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION transition_job_status IS 'Safely transition a job status with validation';

