# Applying the Billing System Migration

This guide explains how to apply the billing system migration to create the necessary database tables for SaaS billing functionality.

## Migration Overview

The migration `20260105100000_create_billing_system.sql` creates:

1. **plans** - Available subscription plans (Starter, Pro, Brand, Agency)
2. **subscriptions** - User subscription records
3. **credit_ledger** - Credit transaction history
4. **usage_counters** - Daily generation usage tracking

It also:
- Enables Row Level Security (RLS) on all tables
- Creates helper functions for credit management
- Seeds the plans table with pricing data

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Supabase project set up and linked
- Database connection configured

## Option 1: Apply via Supabase CLI (Recommended)

### Step 1: Link your project (if not already linked)
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 2: Apply the migration
```bash
supabase db push
```

This will apply all pending migrations in the `supabase/migrations/` directory.

## Option 2: Apply Manually via Supabase Dashboard

### Step 1: Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to SQL Editor

### Step 2: Run the Migration
1. Open the file `supabase/migrations/20260105100000_create_billing_system.sql`
2. Copy the entire content
3. Paste it into the SQL Editor
4. Click "Run" to execute

### Step 3: Verify Tables Created
Navigate to "Table Editor" in the dashboard and verify:
- ✅ plans table exists with 4 rows (starter, pro, brand, agency)
- ✅ subscriptions table exists
- ✅ credit_ledger table exists
- ✅ usage_counters table exists

## Option 3: Apply via psql

If you have direct database access:

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres" \
  -f supabase/migrations/20260105100000_create_billing_system.sql
```

## Verification

After applying the migration, verify everything is working:

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('plans', 'subscriptions', 'credit_ledger', 'usage_counters');
```

Should return 4 rows.

### Check Plans Seeded
```sql
SELECT id, name, monthly_price_cents, monthly_credits, overage_cents 
FROM plans 
ORDER BY monthly_price_cents;
```

Should return:
- starter: $19.00 (1900 cents), 50 credits, $0.50 overage
- pro: $49.00 (4900 cents), 200 credits, $0.35 overage
- brand: $99.00 (9900 cents), 500 credits, $0.25 overage
- agency: $249.00 (24900 cents), 2000 credits, $0.20 overage

### Check RLS Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('plans', 'subscriptions', 'credit_ledger', 'usage_counters');
```

All should show `rowsecurity = true`.

### Check Functions Created
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_user_credit_balance',
  'add_credits',
  'increment_usage_counter'
);
```

Should return 3 functions.

## Testing the Billing System

After migration, you can test the system:

### 1. View Plans (as authenticated user)
```typescript
import { getPlans } from '@/lib/db/billing-client'

const plans = await getPlans()
console.log(plans)
```

### 2. Create a Test Subscription
```typescript
import { createSubscription } from '@/lib/db/billing'

const subscription = await createSubscription({
  user_id: 'YOUR_USER_ID',
  plan_id: 'starter',
  status: 'trialing',
  current_period_start: new Date().toISOString(),
  current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
})
```

### 3. Check Credit Balance
```typescript
import { getUserCreditBalance } from '@/lib/db/billing'

const balance = await getUserCreditBalance('YOUR_USER_ID')
console.log(`Credit balance: ${balance}`)
```

### 4. Add Credits
```typescript
import { addCredits } from '@/lib/db/billing'

// Add 50 starter plan credits
await addCredits('YOUR_USER_ID', 50, 'subscription_reset', 'subscription', null)
```

### 5. Deduct Credits for Generation
```typescript
import { deductCreditsForGeneration } from '@/lib/db/billing'

await deductCreditsForGeneration('YOUR_USER_ID', 'JOB_ID')
```

## Troubleshooting

### Error: "relation already exists"
If tables already exist, the migration uses `CREATE TABLE IF NOT EXISTS` and will skip creation. This is safe.

### Error: "permission denied"
Ensure you're using a user with sufficient permissions (postgres role or service_role).

### RLS Blocking Access
If you can't access tables:
1. Check you're authenticated: `const { data: { user } } = await supabase.auth.getUser()`
2. Verify RLS policies are correct
3. For admin operations, use service_role key

## Next Steps

After migration is applied:

1. **Set up Stripe integration** for payment processing
2. **Create subscription flow** in the app
3. **Add credit checking** before generations
4. **Implement billing page** to show usage and credits
5. **Add webhook handlers** for Stripe events

## Files Created

This migration is accompanied by:

- `lib/db/billing-types.ts` - TypeScript types
- `lib/db/billing.ts` - Server-side helpers
- `lib/db/billing-client.ts` - Client-side helpers

Import these in your application code to interact with the billing system.

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify your database connection
3. Ensure all migrations are in order
4. Check RLS policies are enabled

For more help, see:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

