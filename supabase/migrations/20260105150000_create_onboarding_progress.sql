-- Create onboarding_progress table to track user onboarding checklist
CREATE TABLE IF NOT EXISTS onboarding_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_photo BOOLEAN DEFAULT false,
  generated_main_image BOOLEAN DEFAULT false,
  generated_lifestyle_image BOOLEAN DEFAULT false,
  downloaded_asset BOOLEAN DEFAULT false,
  checklist_dismissed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_onboarding_progress_user_id ON onboarding_progress(user_id);

-- Enable RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own onboarding progress
CREATE POLICY "Users can view own onboarding progress"
  ON onboarding_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress"
  ON onboarding_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress"
  ON onboarding_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER trigger_update_onboarding_progress_updated_at
  BEFORE UPDATE ON onboarding_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_onboarding_progress_updated_at();

-- Function to check if onboarding is complete
CREATE OR REPLACE FUNCTION is_onboarding_complete(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_progress RECORD;
BEGIN
  SELECT * INTO v_progress
  FROM onboarding_progress
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  RETURN v_progress.uploaded_photo 
    AND v_progress.generated_main_image 
    AND v_progress.generated_lifestyle_image 
    AND v_progress.downloaded_asset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE onboarding_progress IS 'Tracks user onboarding checklist progress';
COMMENT ON COLUMN onboarding_progress.uploaded_photo IS 'User has uploaded their first product photo';
COMMENT ON COLUMN onboarding_progress.generated_main_image IS 'User has generated a main white background image';
COMMENT ON COLUMN onboarding_progress.generated_lifestyle_image IS 'User has generated a lifestyle image';
COMMENT ON COLUMN onboarding_progress.downloaded_asset IS 'User has downloaded their first generated asset';
COMMENT ON COLUMN onboarding_progress.checklist_dismissed IS 'User manually dismissed the checklist';
COMMENT ON COLUMN onboarding_progress.completed_at IS 'Timestamp when all checklist items were completed';
