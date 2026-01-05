# Credit System Documentation

This document explains the CommercePix credit system, including SQL views, functions, and helper methods.

## Overview

The credit system is the core of CommercePix's billing model. Users purchase subscription plans that include monthly credits, which are spent when generating images. The system:

- Tracks all credit transactions in an audit trail
- Prevents negative balances transactionally
- Supports pay-as-you-go overage charges
- Provides real-time balance lookups via optimized SQL views

## Database Architecture

### Tables

#### `credit_ledger`
The single source of truth for all credit transactions. Every credit addition or deduction creates an entry.

```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- delta (int): positive = add, negative = spend
- reason: subscription_reset | generation | bonus | admin_adjust | overage_purchase
- ref_type: job | subscription | admin | purchase (nullable)
- ref_id (uuid, nullable)
- created_at (timestamptz)
```

### SQL Views

#### `user_credit_balance`
Aggregated view that sums `credit_ledger` per user for fast balance lookups.

```sql
SELECT 
    user_id,
    COALESCE(SUM(delta), 0)::int AS balance,
    COUNT(*) AS transaction_count,
    MAX(created_at) AS last_transaction_at
FROM credit_ledger
GROUP BY user_id
```

**Benefits:**
- Fast lookups (aggregated once, cached)
- Always accurate (based on ledger)
- No race conditions

## SQL Functions

### 1. `get_user_credit_balance(user_id)`

Returns current credit balance for a user.

```sql
SELECT get_user_credit_balance('user-uuid-here');
-- Returns: 150 (integer)
```

**Features:**
- Uses `user_credit_balance` view for speed
- Security definer (runs with elevated privileges)
- Stable (can be cached)

### 2. `spend_credits(user_id, amount, reason, ref_type, ref_id)`

Transactionally spends credits with balance validation.

```sql
SELECT spend_credits(
    'user-uuid',
    1,                    -- amount
    'generation',         -- reason
    'job',                -- ref_type
    'job-uuid'            -- ref_id
);

-- Returns JSONB:
{
  "success": true,
  "ledger_id": "...",
  "amount_spent": 1,
  "previous_balance": 150,
  "new_balance": 149
}
```

**Features:**
- ✅ **Transactional**: Uses `FOR UPDATE` lock
- ✅ **Atomic**: All-or-nothing operation
- ✅ **Prevents negative balances**: Returns error if insufficient
- ✅ **Race condition safe**: Row-level locking

**Error Response:**
```json
{
  "success": false,
  "error": "Insufficient credits",
  "balance": 0,
  "required": 1,
  "shortfall": 1
}
```

### 3. `grant_monthly_credits(user_id, plan_id)`

Grants monthly credits based on subscription plan.

```sql
SELECT grant_monthly_credits('user-uuid', 'pro');

-- Returns JSONB:
{
  "success": true,
  "ledger_id": "...",
  "credits_granted": 200,
  "plan_id": "pro",
  "previous_balance": 10,
  "new_balance": 210
}
```

**Use Cases:**
- Subscription renewal
- Period reset (monthly)
- Plan upgrades
- New subscriptions

### 4. `has_sufficient_credits(user_id, required_amount)`

Boolean check for sufficient credits.

```sql
SELECT has_sufficient_credits('user-uuid', 5);
-- Returns: true or false
```

**Use Cases:**
- Pre-generation validation
- UI state (enable/disable buttons)
- Quick checks before expensive operations

### 5. `grant_bonus_credits(user_id, amount, note)`

Admin function to grant bonus credits.

```sql
SELECT grant_bonus_credits('user-uuid', 50, 'Holiday promotion');

-- Returns JSONB:
{
  "success": true,
  "ledger_id": "...",
  "credits_granted": 50,
  "note": "Holiday promotion",
  "previous_balance": 100,
  "new_balance": 150
}
```

**Use Cases:**
- Promotions
- Refunds
- Customer support
- Referral bonuses

### 6. `get_credit_summary(user_id)`

Returns comprehensive credit information.

```sql
SELECT get_credit_summary('user-uuid');

-- Returns JSONB:
{
  "balance": 150,
  "transaction_count": 25,
  "last_transaction_at": "2026-01-05T10:30:00Z",
  "total_earned": 200,
  "total_spent": 50,
  "subscription_plan": "pro",
  "monthly_allowance": 200
}
```

## TypeScript Helpers

### Server Functions (`lib/db/billing.ts`)

#### `getCreditBalance(userId: string): Promise<number>`

```typescript
import { getCreditBalance } from '@/lib/db/billing'

const balance = await getCreditBalance(userId)
console.log(`Balance: ${balance} credits`)
```

#### `spendCredits(userId, amount, reason?, refType?, refId?)`

```typescript
import { spendCredits } from '@/lib/db/billing'

const result = await spendCredits(
  userId,
  1,
  'generation',
  'job',
  jobId
)

if (result.success) {
  console.log(`Spent 1 credit. New balance: ${result.new_balance}`)
} else {
  console.error(`Failed: ${result.error}`)
  if (result.shortfall) {
    console.log(`Need ${result.shortfall} more credits`)
  }
}
```

#### `grantMonthlyCredits(userId, planId)`

```typescript
import { grantMonthlyCredits } from '@/lib/db/billing'

// On subscription renewal
const result = await grantMonthlyCredits(userId, 'pro')

if (result.success) {
  console.log(`Granted ${result.credits_granted} credits`)
}
```

#### `hasSufficientCredits(userId, required?)`

```typescript
import { hasSufficientCredits } from '@/lib/db/billing'

const canGenerate = await hasSufficientCredits(userId, 1)

if (!canGenerate) {
  return { error: 'Insufficient credits. Please upgrade your plan.' }
}
```

#### `grantBonusCredits(userId, amount, note?)`

```typescript
import { grantBonusCredits } from '@/lib/db/billing'

// Admin action
await grantBonusCredits(userId, 100, 'New user bonus')
```

#### `getCreditSummary(userId)`

```typescript
import { getCreditSummary } from '@/lib/db/billing'

const summary = await getCreditSummary(userId)

console.log(`Balance: ${summary.balance}`)
console.log(`Total earned: ${summary.total_earned}`)
console.log(`Total spent: ${summary.total_spent}`)
console.log(`Plan: ${summary.subscription_plan}`)
```

### Client Functions (`lib/db/billing-client.ts`)

All server functions have client-side equivalents that work with the current authenticated user:

```typescript
import {
  getCurrentUserCreditBalance,
  hasSufficientCredits,
  getCreditSummary
} from '@/lib/db/billing-client'

// In a client component
const balance = await getCurrentUserCreditBalance()
const canGenerate = await hasSufficientCredits(5)
const summary = await getCreditSummary()
```

## Usage Examples

### Pre-Generation Check

```typescript
import { hasSufficientCredits, spendCredits } from '@/lib/db/billing'

export async function generateImage(userId: string, params: any) {
  // Check credits before starting
  const hasCredits = await hasSufficientCredits(userId, 1)
  
  if (!hasCredits) {
    return {
      error: 'Insufficient credits',
      code: 'INSUFFICIENT_CREDITS'
    }
  }
  
  // Start generation job
  const job = await createGenerationJob(userId, params)
  
  // Spend credit with reference to job
  const result = await spendCredits(
    userId,
    1,
    'generation',
    'job',
    job.id
  )
  
  if (!result.success) {
    // Race condition: someone else spent the last credit
    await cancelJob(job.id)
    return {
      error: result.error,
      code: 'CREDIT_SPENT_RACE'
    }
  }
  
  return { job, credits_remaining: result.new_balance }
}
```

### Subscription Renewal

```typescript
import { grantMonthlyCredits } from '@/lib/db/billing'

export async function handleSubscriptionRenewal(userId: string, planId: string) {
  // Grant monthly credits
  const result = await grantMonthlyCredits(userId, planId)
  
  if (result.success) {
    // Send notification email
    await sendEmail(userId, {
      subject: 'Your credits have been renewed!',
      body: `You received ${result.credits_granted} credits for your ${planId} plan.`
    })
  }
  
  return result
}
```

### Display Credit Balance in UI

```typescript
'use client'

import { useEffect, useState } from 'react'
import { getCreditSummary } from '@/lib/db/billing-client'

export function CreditBalance() {
  const [summary, setSummary] = useState<any>(null)
  
  useEffect(() => {
    getCreditSummary().then(setSummary)
  }, [])
  
  if (!summary) return <div>Loading...</div>
  
  return (
    <div>
      <h3>Credit Balance</h3>
      <p className="text-2xl font-bold">{summary.balance} credits</p>
      <p className="text-sm text-muted-foreground">
        {summary.monthly_allowance} credits/month on {summary.subscription_plan} plan
      </p>
      <div className="mt-4">
        <p>Total earned: {summary.total_earned}</p>
        <p>Total spent: {summary.total_spent}</p>
        <p>Transactions: {summary.transaction_count}</p>
      </div>
    </div>
  )
}
```

## Security Considerations

1. **RLS Enabled**: All tables have Row Level Security
2. **Function Security**: 
   - `spend_credits()` is SECURITY DEFINER for transaction control
   - Users can call it, but it validates permissions
3. **Race Conditions**: `FOR UPDATE` locks prevent double-spending
4. **Audit Trail**: Every transaction logged with reason and reference
5. **Service Role**: Some functions (grant credits) restricted to service_role

## Performance

### Indexes
```sql
-- Fast user lookups
idx_credit_ledger_user_id ON credit_ledger(user_id)

-- Balance queries
idx_credit_ledger_user_created ON credit_ledger(user_id, created_at DESC)

-- Reason analytics
idx_credit_ledger_reason ON credit_ledger(reason)

-- Earned vs spent
idx_credit_ledger_delta_sign ON credit_ledger(user_id, SIGN(delta))
```

### Query Performance
- ✅ Balance lookup: O(1) via view (aggregated)
- ✅ Spend credits: O(1) with row lock
- ✅ Credit history: O(n) with index, limited results

## Testing

### Test Credit Flow

```sql
-- 1. Grant monthly credits
SELECT grant_monthly_credits('user-uuid', 'starter');
-- Should grant 50 credits

-- 2. Check balance
SELECT get_user_credit_balance('user-uuid');
-- Should return 50

-- 3. Spend some credits
SELECT spend_credits('user-uuid', 10, 'generation', 'job', 'job-uuid');
-- Should succeed, return balance 40

-- 4. Try to overspend
SELECT spend_credits('user-uuid', 50, 'generation', 'job', 'job-uuid-2');
-- Should fail: insufficient credits

-- 5. Check summary
SELECT get_credit_summary('user-uuid');
-- Should show: balance=40, earned=50, spent=10
```

## Migration

To apply the credit system:

```bash
supabase db push
```

Or apply manually via SQL Editor:
1. First apply: `20260105100000_create_billing_system.sql`
2. Then apply: `20260105110000_add_credit_views_and_functions.sql`

## Troubleshooting

### "Insufficient credits" when balance shows positive
- Check for race conditions (multiple requests)
- Verify view is up-to-date: `SELECT * FROM user_credit_balance WHERE user_id = ?`

### Balance not updating
- Verify ledger entries: `SELECT * FROM credit_ledger WHERE user_id = ? ORDER BY created_at DESC`
- Check for database lag (views should update immediately)

### Permission denied
- Ensure RLS policies are correct
- Use service_role for admin operations

## Next Steps

1. **Stripe Integration**: Connect overage charges to Stripe
2. **Webhooks**: Auto-grant credits on subscription renewal
3. **Notifications**: Alert users when running low on credits
4. **Analytics**: Track usage patterns per plan
5. **Optimization**: Consider materialized view if scaling issues

## Support

For issues or questions:
- Check database logs in Supabase dashboard
- Review credit_ledger for transaction history
- Verify RLS policies are enabled
- Test with service_role for debugging

