-- Create usage_counters table for rate limiting
CREATE TABLE IF NOT EXISTS public.usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  counter_type TEXT NOT NULL CHECK (counter_type IN ('per_minute', 'per_day')),
  count INT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index to ensure one counter per user per type per period
CREATE UNIQUE INDEX idx_usage_counters_user_type 
  ON public.usage_counters(user_id, counter_type, period_start);

-- Create index for user_id lookups
CREATE INDEX idx_usage_counters_user_id ON public.usage_counters(user_id);

-- Create index for period_start (for cleanup)
CREATE INDEX idx_usage_counters_period_start ON public.usage_counters(period_start);

-- Enable Row Level Security
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own counters
CREATE POLICY "Users can read own usage counters"
  ON public.usage_counters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own counters
CREATE POLICY "Users can insert own usage counters"
  ON public.usage_counters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own counters
CREATE POLICY "Users can update own usage counters"
  ON public.usage_counters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own counters
CREATE POLICY "Users can delete own usage counters"
  ON public.usage_counters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_usage_counters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_usage_counters_updated_at
  BEFORE UPDATE ON public.usage_counters
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_counters_updated_at();

-- Function to clean up old counters (run periodically)
-- Removes per_minute counters older than 2 minutes
-- Removes per_day counters older than 2 days
CREATE OR REPLACE FUNCTION cleanup_old_usage_counters()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.usage_counters
  WHERE 
    (counter_type = 'per_minute' AND period_start < NOW() - INTERVAL '2 minutes')
    OR
    (counter_type = 'per_day' AND period_start < NOW() - INTERVAL '2 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.usage_counters TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

