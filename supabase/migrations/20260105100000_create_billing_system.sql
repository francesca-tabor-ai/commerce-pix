-- =====================================================
-- BILLING SYSTEM MIGRATION
-- =====================================================
-- Creates tables for SaaS billing: plans, subscriptions, 
-- credit_ledger, and usage_counters with RLS policies
-- =====================================================

-- =====================================================
-- 1. PLANS TABLE
-- =====================================================
-- Stores available subscription plans
CREATE TABLE IF NOT EXISTS public.plans (
    id text PRIMARY KEY,
    name text NOT NULL,
    monthly_price_cents int NOT NULL,
    monthly_credits int NOT NULL,
    overage_cents int NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plans (readable by all authenticated users)
CREATE POLICY "Plans are viewable by authenticated users"
    ON public.plans
    FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can insert/update/delete plans
CREATE POLICY "Plans are managed by service role only"
    ON public.plans
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 2. SUBSCRIPTIONS TABLE
-- =====================================================
-- Stores user subscription information
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    plan_id text NOT NULL REFERENCES public.plans(id),
    status text NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled')),
    current_period_start timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end boolean DEFAULT false,
    stripe_customer_id text,
    stripe_subscription_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
    ON public.subscriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
    ON public.subscriptions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to subscriptions"
    ON public.subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 3. CREDIT LEDGER TABLE
-- =====================================================
-- Tracks all credit additions and deductions
CREATE TABLE IF NOT EXISTS public.credit_ledger (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    delta int NOT NULL, -- positive = add credits, negative = spend credits
    reason text NOT NULL CHECK (reason IN ('subscription_reset', 'generation', 'bonus', 'admin_adjust', 'overage_purchase')),
    ref_type text CHECK (ref_type IN ('job', 'subscription', 'admin', 'purchase') OR ref_type IS NULL),
    ref_id uuid,
    created_at timestamptz DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX idx_credit_ledger_user_id ON public.credit_ledger(user_id);
CREATE INDEX idx_credit_ledger_created_at ON public.credit_ledger(created_at DESC);
CREATE INDEX idx_credit_ledger_user_created ON public.credit_ledger(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credit_ledger
CREATE POLICY "Users can view their own credit history"
    ON public.credit_ledger
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Only service role can insert/update/delete credit entries
CREATE POLICY "Service role can manage credit ledger"
    ON public.credit_ledger
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 4. USAGE COUNTERS TABLE (Update existing or create)
-- =====================================================
-- Note: This table may already exist from previous migration
-- We'll use CREATE IF NOT EXISTS to avoid conflicts
CREATE TABLE IF NOT EXISTS public.usage_counters (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day date NOT NULL DEFAULT CURRENT_DATE,
    generations int DEFAULT 0,
    updated_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, day)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_usage_counters_day ON public.usage_counters(day);
CREATE INDEX IF NOT EXISTS idx_usage_counters_user_day ON public.usage_counters(user_id, day DESC);

-- Enable RLS if not already enabled
ALTER TABLE public.usage_counters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_counters;
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.usage_counters;
DROP POLICY IF EXISTS "Users can update their own usage" ON public.usage_counters;
DROP POLICY IF EXISTS "Service role has full access to usage counters" ON public.usage_counters;

-- RLS Policies for usage_counters
CREATE POLICY "Users can view their own usage"
    ON public.usage_counters
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
    ON public.usage_counters
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
    ON public.usage_counters
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role has full access
CREATE POLICY "Service role has full access to usage counters"
    ON public.usage_counters
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to get user's current credit balance
CREATE OR REPLACE FUNCTION get_user_credit_balance(p_user_id uuid)
RETURNS int
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE(SUM(delta), 0)::int
    FROM public.credit_ledger
    WHERE user_id = p_user_id;
$$;

-- Function to add credits to ledger
CREATE OR REPLACE FUNCTION add_credits(
    p_user_id uuid,
    p_delta int,
    p_reason text,
    p_ref_type text DEFAULT NULL,
    p_ref_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ledger_id uuid;
BEGIN
    INSERT INTO public.credit_ledger (user_id, delta, reason, ref_type, ref_id)
    VALUES (p_user_id, p_delta, p_reason, p_ref_type, p_ref_id)
    RETURNING id INTO v_ledger_id;
    
    RETURN v_ledger_id;
END;
$$;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage_counter(
    p_user_id uuid,
    p_day date DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.usage_counters (user_id, day, generations, updated_at)
    VALUES (p_user_id, p_day, 1, now())
    ON CONFLICT (user_id, day)
    DO UPDATE SET
        generations = usage_counters.generations + 1,
        updated_at = now();
END;
$$;

-- =====================================================
-- 6. SEED PLANS TABLE
-- =====================================================
-- Insert the pricing plans from the pricing page

INSERT INTO public.plans (id, name, monthly_price_cents, monthly_credits, overage_cents, features)
VALUES
    (
        'starter',
        'Starter',
        1900, -- $19.00
        50,
        50, -- $0.50 per additional credit
        '[
            "50 generation credits/month",
            "All 4 modes (Main, Lifestyle, Feature, Packaging)",
            "$0.50 per additional credit",
            "1080p resolution",
            "Email support",
            "Basic analytics"
        ]'::jsonb
    ),
    (
        'pro',
        'Pro',
        4900, -- $49.00
        200,
        35, -- $0.35 per additional credit
        '[
            "200 generation credits/month",
            "All 4 modes",
            "$0.35 per additional credit",
            "4K resolution",
            "Priority support",
            "Advanced analytics",
            "API access"
        ]'::jsonb
    ),
    (
        'brand',
        'Brand',
        9900, -- $99.00
        500,
        25, -- $0.25 per additional credit
        '[
            "500 generation credits/month",
            "All 4 modes",
            "$0.25 per additional credit",
            "4K resolution",
            "Priority support",
            "Advanced analytics",
            "API access",
            "Custom templates",
            "Batch processing"
        ]'::jsonb
    ),
    (
        'agency',
        'Agency',
        24900, -- $249.00
        2000,
        20, -- $0.20 per additional credit
        '[
            "2,000 generation credits/month",
            "All 4 modes",
            "$0.20 per additional credit",
            "4K+ resolution",
            "Dedicated account manager",
            "White-label options",
            "Advanced API access",
            "Custom integrations",
            "Team collaboration tools",
            "SLA guarantee"
        ]'::jsonb
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    monthly_price_cents = EXCLUDED.monthly_price_cents,
    monthly_credits = EXCLUDED.monthly_credits,
    overage_cents = EXCLUDED.overage_cents,
    features = EXCLUDED.features,
    updated_at = now();

-- =====================================================
-- 7. GRANTS
-- =====================================================
-- Grant necessary permissions

GRANT SELECT ON public.plans TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.credit_ledger TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.usage_counters TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_credit_balance(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits(uuid, int, text, text, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION increment_usage_counter(uuid, date) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created:
--   1. plans (pricing tiers)
--   2. subscriptions (user subscriptions)
--   3. credit_ledger (credit tracking)
--   4. usage_counters (daily usage)
--
-- RLS enabled on all tables
-- Helper functions created
-- Plans seeded with pricing data
-- =====================================================

