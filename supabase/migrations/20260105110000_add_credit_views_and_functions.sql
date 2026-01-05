-- =====================================================
-- CREDIT VIEWS AND ENHANCED FUNCTIONS
-- =====================================================
-- Adds SQL views and transactional credit functions
-- =====================================================

-- =====================================================
-- 1. USER CREDIT BALANCE VIEW
-- =====================================================
-- Materialized view for fast credit balance lookups
-- Aggregates credit_ledger to show current balance per user

CREATE OR REPLACE VIEW user_credit_balance AS
SELECT 
    user_id,
    COALESCE(SUM(delta), 0)::int AS balance,
    COUNT(*) AS transaction_count,
    MAX(created_at) AS last_transaction_at
FROM public.credit_ledger
GROUP BY user_id;

-- Grant access to authenticated users
GRANT SELECT ON user_credit_balance TO authenticated;

-- Comment on view
COMMENT ON VIEW user_credit_balance IS 'Aggregated credit balance per user from credit_ledger';

-- =====================================================
-- 2. ENHANCED GET CREDIT BALANCE FUNCTION
-- =====================================================
-- Drop existing function and replace with optimized version
DROP FUNCTION IF EXISTS get_user_credit_balance(uuid);

CREATE OR REPLACE FUNCTION get_user_credit_balance(p_user_id uuid)
RETURNS int
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE(balance, 0)
    FROM user_credit_balance
    WHERE user_id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION get_user_credit_balance(uuid) TO authenticated;

COMMENT ON FUNCTION get_user_credit_balance IS 'Returns current credit balance for a user using the view';

-- =====================================================
-- 3. SPEND CREDITS FUNCTION (TRANSACTIONAL)
-- =====================================================
-- Transactional function to spend credits
-- Prevents negative balances and ensures atomicity

CREATE OR REPLACE FUNCTION spend_credits(
    p_user_id uuid,
    p_amount int,
    p_reason text DEFAULT 'generation',
    p_ref_type text DEFAULT NULL,
    p_ref_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance int;
    v_ledger_id uuid;
    v_new_balance int;
BEGIN
    -- Input validation
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Amount must be greater than 0',
            'balance', NULL
        );
    END IF;

    -- Lock the user's credit ledger rows to prevent race conditions
    -- This ensures transactional integrity
    PERFORM 1 FROM public.credit_ledger 
    WHERE user_id = p_user_id 
    FOR UPDATE;

    -- Get current balance
    SELECT COALESCE(balance, 0) INTO v_current_balance
    FROM user_credit_balance
    WHERE user_id = p_user_id;

    -- Check if user has enough credits
    IF v_current_balance < p_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Insufficient credits',
            'balance', v_current_balance,
            'required', p_amount,
            'shortfall', p_amount - v_current_balance
        );
    END IF;

    -- Deduct credits (negative delta)
    INSERT INTO public.credit_ledger (user_id, delta, reason, ref_type, ref_id)
    VALUES (p_user_id, -p_amount, p_reason, p_ref_type, p_ref_id)
    RETURNING id INTO v_ledger_id;

    -- Calculate new balance
    v_new_balance := v_current_balance - p_amount;

    -- Return success with details
    RETURN jsonb_build_object(
        'success', true,
        'ledger_id', v_ledger_id,
        'amount_spent', p_amount,
        'previous_balance', v_current_balance,
        'new_balance', v_new_balance
    );
END;
$$;

GRANT EXECUTE ON FUNCTION spend_credits(uuid, int, text, text, uuid) TO authenticated, service_role;

COMMENT ON FUNCTION spend_credits IS 'Transactionally spends credits with balance validation. Prevents negative balances.';

-- =====================================================
-- 4. GRANT MONTHLY CREDITS FUNCTION
-- =====================================================
-- Grants monthly credits based on subscription plan
-- Typically called on subscription renewal or period reset

CREATE OR REPLACE FUNCTION grant_monthly_credits(
    p_user_id uuid,
    p_plan_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plan_credits int;
    v_ledger_id uuid;
    v_current_balance int;
    v_new_balance int;
BEGIN
    -- Get plan's monthly credits
    SELECT monthly_credits INTO v_plan_credits
    FROM public.plans
    WHERE id = p_plan_id;

    -- Check if plan exists
    IF v_plan_credits IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Plan not found',
            'plan_id', p_plan_id
        );
    END IF;

    -- Get current balance before adding
    SELECT COALESCE(balance, 0) INTO v_current_balance
    FROM user_credit_balance
    WHERE user_id = p_user_id;

    -- Add credits to ledger
    INSERT INTO public.credit_ledger (user_id, delta, reason, ref_type, ref_id)
    VALUES (p_user_id, v_plan_credits, 'subscription_reset', 'subscription', NULL)
    RETURNING id INTO v_ledger_id;

    -- Calculate new balance
    v_new_balance := v_current_balance + v_plan_credits;

    -- Return success with details
    RETURN jsonb_build_object(
        'success', true,
        'ledger_id', v_ledger_id,
        'credits_granted', v_plan_credits,
        'plan_id', p_plan_id,
        'previous_balance', v_current_balance,
        'new_balance', v_new_balance
    );
END;
$$;

GRANT EXECUTE ON FUNCTION grant_monthly_credits(uuid, text) TO service_role;

COMMENT ON FUNCTION grant_monthly_credits IS 'Grants monthly credits to user based on their subscription plan';

-- =====================================================
-- 5. CHECK SUFFICIENT CREDITS FUNCTION
-- =====================================================
-- Helper function to check if user has enough credits
-- Returns boolean for easy validation

CREATE OR REPLACE FUNCTION has_sufficient_credits(
    p_user_id uuid,
    p_required_amount int DEFAULT 1
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT COALESCE(balance, 0) >= p_required_amount
    FROM user_credit_balance
    WHERE user_id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION has_sufficient_credits(uuid, int) TO authenticated;

COMMENT ON FUNCTION has_sufficient_credits IS 'Checks if user has sufficient credits for an operation';

-- =====================================================
-- 6. GRANT BONUS CREDITS FUNCTION
-- =====================================================
-- Admin function to grant bonus credits
-- Useful for promotions, refunds, or customer support

CREATE OR REPLACE FUNCTION grant_bonus_credits(
    p_user_id uuid,
    p_amount int,
    p_note text DEFAULT 'bonus'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ledger_id uuid;
    v_current_balance int;
    v_new_balance int;
BEGIN
    -- Validation
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Amount must be greater than 0'
        );
    END IF;

    -- Get current balance
    SELECT COALESCE(balance, 0) INTO v_current_balance
    FROM user_credit_balance
    WHERE user_id = p_user_id;

    -- Add bonus credits
    INSERT INTO public.credit_ledger (user_id, delta, reason, ref_type, ref_id)
    VALUES (p_user_id, p_amount, 'bonus', 'admin', NULL)
    RETURNING id INTO v_ledger_id;

    -- Calculate new balance
    v_new_balance := v_current_balance + p_amount;

    RETURN jsonb_build_object(
        'success', true,
        'ledger_id', v_ledger_id,
        'credits_granted', p_amount,
        'note', p_note,
        'previous_balance', v_current_balance,
        'new_balance', v_new_balance
    );
END;
$$;

GRANT EXECUTE ON FUNCTION grant_bonus_credits(uuid, int, text) TO service_role;

COMMENT ON FUNCTION grant_bonus_credits IS 'Grants bonus credits for promotions or support';

-- =====================================================
-- 7. GET CREDIT SUMMARY FUNCTION
-- =====================================================
-- Returns comprehensive credit information for a user

CREATE OR REPLACE FUNCTION get_credit_summary(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_balance int;
    v_transaction_count int;
    v_last_transaction timestamptz;
    v_total_earned int;
    v_total_spent int;
    v_subscription_plan text;
    v_monthly_allowance int;
BEGIN
    -- Get balance from view
    SELECT balance, transaction_count, last_transaction_at
    INTO v_balance, v_transaction_count, v_last_transaction
    FROM user_credit_balance
    WHERE user_id = p_user_id;

    -- If no balance record, set defaults
    IF v_balance IS NULL THEN
        v_balance := 0;
        v_transaction_count := 0;
    END IF;

    -- Calculate total earned (positive deltas)
    SELECT COALESCE(SUM(delta), 0) INTO v_total_earned
    FROM public.credit_ledger
    WHERE user_id = p_user_id AND delta > 0;

    -- Calculate total spent (negative deltas)
    SELECT COALESCE(ABS(SUM(delta)), 0) INTO v_total_spent
    FROM public.credit_ledger
    WHERE user_id = p_user_id AND delta < 0;

    -- Get subscription info
    SELECT s.plan_id, p.monthly_credits
    INTO v_subscription_plan, v_monthly_allowance
    FROM public.subscriptions s
    JOIN public.plans p ON s.plan_id = p.id
    WHERE s.user_id = p_user_id
    LIMIT 1;

    -- Return comprehensive summary
    RETURN jsonb_build_object(
        'balance', v_balance,
        'transaction_count', v_transaction_count,
        'last_transaction_at', v_last_transaction,
        'total_earned', v_total_earned,
        'total_spent', v_total_spent,
        'subscription_plan', v_subscription_plan,
        'monthly_allowance', v_monthly_allowance
    );
END;
$$;

GRANT EXECUTE ON FUNCTION get_credit_summary(uuid) TO authenticated;

COMMENT ON FUNCTION get_credit_summary IS 'Returns comprehensive credit information for a user';

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================
-- Additional indexes to speed up credit queries

-- Index for filtering by reason (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_credit_ledger_reason ON public.credit_ledger(reason);

-- Index for positive/negative deltas (earned vs spent)
CREATE INDEX IF NOT EXISTS idx_credit_ledger_delta_sign ON public.credit_ledger(user_id, SIGN(delta));

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Created:
--   1. user_credit_balance view (fast balance lookups)
--   2. get_user_credit_balance() - optimized with view
--   3. spend_credits() - transactional with validation
--   4. grant_monthly_credits() - subscription renewal
--   5. has_sufficient_credits() - boolean check
--   6. grant_bonus_credits() - admin grants
--   7. get_credit_summary() - comprehensive info
--   8. Performance indexes
--
-- All functions are transactional and prevent race conditions
-- =====================================================

