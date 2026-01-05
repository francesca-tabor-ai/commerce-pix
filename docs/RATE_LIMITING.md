# Rate Limiting & Abuse Protection

Complete guide to CommercePix's rate limiting system for AI generation.

## Overview

CommercePix implements intelligent rate limiting to prevent abuse, ensure fair resource allocation, and encourage plan upgrades. The system uses time-based counters stored in the database and applies different limits based on user subscription status.

## Rate Limits

### Per-Minute Limits (All Users)

**Purpose:** Prevent API abuse and ensure system stability

| User Type | Limit | Window | Purpose |
|-----------|-------|--------|---------|
| All Users | 5 generations | 1 minute (rolling) | Abuse prevention |

**Applies to:**
- Trial users
- Free users
- Paid users
- All subscription statuses

**Reset:** Rolling 1-minute window (resets at start of next minute)

---

### Daily Limits (Subscription-Based)

**Purpose:** Encourage upgrades and monetization

| User Type | Limit | Window | Purpose |
|-----------|-------|--------|---------|
| Trial/Free | 100 generations | 1 day (UTC) | Trial limitation |
| Paid (Active) | Unlimited* | N/A | Paid benefit |

*_Paid users have no daily limit, only per-minute limit applies_

**Trial/Free includes:**
- `status: 'trialing'`
- `status: 'canceled'`
- `status: 'past_due'`
- No subscription

**Paid (Active) includes:**
- `status: 'active'`

**Reset:** Midnight UTC daily

---

## Implementation

### Rate Limit Configuration

```typescript
// lib/rate-limit.ts
export const RATE_LIMITS = {
  // All users (prevents API abuse)
  GENERATIONS_PER_MINUTE: 5,
  
  // Trial/free users only
  TRIAL_GENERATIONS_PER_DAY: 100,
  
  // Paid users (effectively unlimited)
  PAID_GENERATIONS_PER_DAY: Number.MAX_SAFE_INTEGER,
}
```

### Usage Counters Table

```sql
CREATE TABLE usage_counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  counter_type TEXT NOT NULL CHECK (counter_type IN ('per_minute', 'per_day')),
  count INT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, counter_type, period_start)
);
```

**Counter Types:**
- `per_minute` - Rolling minute window
- `per_day` - Daily window (midnight UTC)

**Period Start:**
- `per_minute`: Rounded down to current minute
- `per_day`: Start of day (00:00:00 UTC)

---

## API Integration

### Check Rate Limits

```typescript
import { checkAllRateLimits } from '@/lib/rate-limit'

// Check all limits before generation
const rateLimitCheck = await checkAllRateLimits(userId)

if (!rateLimitCheck.allowed) {
  // User hit a limit
  const blockedBy = rateLimitCheck.blockedBy // 'per_minute' or 'per_day'
  const limit = rateLimitCheck[blockedBy]
  
  return {
    error: 'Rate limit exceeded',
    message: limit.message,
    upgradeRequired: limit.upgradeRequired,
  }
}
```

### Record Usage

```typescript
import { recordGenerationUsage } from '@/lib/rate-limit'

// After successful generation start, increment counters
await recordGenerationUsage(userId)
```

### Get Current Usage

```typescript
import { getUserUsageStats } from '@/lib/rate-limit'

const stats = await getUserUsageStats(userId)

console.log(stats)
// {
//   perMinute: { current: 2, limit: 5, remaining: 3 },
//   perDay: { current: 45, limit: 100, remaining: 55, isTrialUser: true }
// }
```

---

## Error Responses

### Per-Minute Limit (429)

**All Users:**

```json
{
  "error": "Rate limit exceeded",
  "message": "Slow down! You've reached the maximum of 5 generations per minute. Please wait 42 seconds before trying again.",
  "code": "RATE_LIMIT_EXCEEDED",
  "rateLimit": {
    "type": "per_minute",
    "limit": 5,
    "current": 5,
    "remaining": 0,
    "resetAt": "2026-01-05T12:05:00.000Z",
    "isPerMinuteLimit": true,
    "isDailyLimit": false,
    "upgradeRequired": false,
    "isTrialUser": false
  }
}
```

**Status:** `429 Too Many Requests`

**Headers:**
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-01-05T12:05:00.000Z
Retry-After: 42
```

**Frontend Action:**
- Show "slow down" message
- Display countdown timer
- Disable generate button
- Auto-enable after reset time

---

### Daily Limit - Trial Users (429)

**Trial/Free Users:**

```json
{
  "error": "Rate limit exceeded",
  "message": "You've reached your daily limit of 100 generations. Upgrade to a paid plan for unlimited daily generations!",
  "code": "UPGRADE_REQUIRED",
  "rateLimit": {
    "type": "per_day",
    "limit": 100,
    "current": 100,
    "remaining": 0,
    "resetAt": "2026-01-06T00:00:00.000Z",
    "isPerMinuteLimit": false,
    "isDailyLimit": true,
    "upgradeRequired": true,
    "isTrialUser": true
  }
}
```

**Status:** `429 Too Many Requests`

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-01-06T00:00:00.000Z
Retry-After: 43200
```

**Frontend Action:**
- Show upgrade modal
- Display "Unlimited generations" benefit
- Highlight paid plan features
- Show reset time as alternative
- Call to action: "Upgrade Now"

---

## Frontend Handling

### React Component Example

```typescript
'use client'

import { useState } from 'react'
import { UpgradeModal } from '@/components/billing/UpgradeModal'
import { toast } from 'sonner'

export function GenerateButton({ projectId, inputAssetId, mode }) {
  const [generating, setGenerating] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<string>()

  const handleGenerate = async () => {
    setGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, inputAssetId, mode }),
      })

      const data = await response.json()

      if (response.status === 429) {
        // Rate limit hit
        const { rateLimit } = data
        
        if (rateLimit.upgradeRequired) {
          // Daily limit hit - show upgrade modal
          setUpgradeReason('daily_limit')
          setShowUpgradeModal(true)
          toast.error(data.message)
        } else if (rateLimit.isPerMinuteLimit) {
          // Per-minute limit - show countdown
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60')
          toast.error(data.message, {
            description: `Try again in ${retryAfter} seconds`,
          })
          
          // Auto-retry after delay (optional)
          setTimeout(() => {
            setGenerating(false)
          }, retryAfter * 1000)
        }
        return
      }

      if (!response.ok) {
        throw new Error(data.error)
      }

      // Success - poll job status
      const { jobId } = data
      pollJobStatus(jobId)
      
    } catch (error) {
      toast.error('Generation failed')
      setGenerating(false)
    }
  }

  return (
    <>
      <Button onClick={handleGenerate} disabled={generating}>
        {generating ? 'Generating...' : 'Generate'}
      </Button>

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason={upgradeReason}
        />
      )}
    </>
  )
}
```

### Upgrade Modal Customization

```typescript
// components/billing/UpgradeModal.tsx

export function UpgradeModal({ isOpen, onClose, reason }) {
  const messages = {
    daily_limit: {
      title: '🚀 Daily Limit Reached!',
      description: 'You\'ve used all 100 daily generations on your trial plan.',
      benefit: 'Upgrade to get unlimited daily generations',
      cta: 'Upgrade Now',
    },
    per_minute: {
      title: '⏱️ Slow Down!',
      description: 'You\'re generating too quickly.',
      benefit: 'Take a short break and try again',
      cta: 'Got It',
    },
  }

  const message = messages[reason] || messages.daily_limit

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{message.title}</DialogTitle>
          <DialogDescription>{message.description}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-lg font-semibold">{message.benefit}</p>
          <ul className="mt-4 space-y-2">
            <li>✅ Unlimited daily generations</li>
            <li>✅ Higher quality outputs</li>
            <li>✅ Priority processing</li>
            <li>✅ Premium support</li>
          </ul>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Maybe Later
          </Button>
          <Link href="/app/billing">
            <Button onClick={onClose}>{message.cta}</Button>
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Subscription Status Detection

### How It Works

```typescript
// lib/rate-limit.ts

// Check subscription status
const subscription = await getUserSubscription(userId)

// Determine if user is on trial/free
const isTrialUser = !subscription || 
                    subscription.status === 'trialing' || 
                    subscription.status === 'canceled' ||
                    subscription.status === 'past_due'

// Apply appropriate limit
const dailyLimit = isTrialUser 
  ? RATE_LIMITS.TRIAL_GENERATIONS_PER_DAY   // 100
  : RATE_LIMITS.PAID_GENERATIONS_PER_DAY    // Unlimited
```

### Subscription Statuses

| Status | Daily Limit | Reason |
|--------|-------------|--------|
| `trialing` | 100 | User on trial period |
| `active` | Unlimited | Active paid subscription |
| `canceled` | 100 | Subscription canceled |
| `past_due` | 100 | Payment failed |
| `null` (no subscription) | 100 | No subscription exists |

---

## Testing

### Manual Testing

#### Test Per-Minute Limit

```bash
# Make 6 rapid requests (limit is 5)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/generate \
    -H "Content-Type: application/json" \
    -H "Cookie: your-session-cookie" \
    -d '{
      "projectId": "project-uuid",
      "inputAssetId": "asset-uuid",
      "mode": "main_white"
    }'
  echo "\nRequest $i completed\n"
done

# Request 6 should return 429
```

#### Test Daily Limit (Trial Users)

```bash
# Set up: Make 100 generations in one day
# Then make one more:
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: trial-user-session-cookie" \
  -d '{
    "projectId": "project-uuid",
    "inputAssetId": "asset-uuid",
    "mode": "main_white"
  }'

# Should return 429 with code: "UPGRADE_REQUIRED"
```

#### Verify Paid Users Have No Daily Limit

```bash
# As paid user, make 150+ generations in one day
# Should all succeed (only per-minute limit applies)
```

### Integration Tests

```typescript
import { describe, it, expect } from '@jest/globals'
import { checkAllRateLimits, recordGenerationUsage } from '@/lib/rate-limit'

describe('Rate Limiting', () => {
  describe('Per-Minute Limits', () => {
    it('should allow up to 5 generations per minute', async () => {
      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        const check = await checkAllRateLimits(testUserId)
        expect(check.allowed).toBe(true)
        await recordGenerationUsage(testUserId)
      }

      // 6th request should be blocked
      const check = await checkAllRateLimits(testUserId)
      expect(check.allowed).toBe(false)
      expect(check.blockedBy).toBe('per_minute')
    })

    it('should reset after 1 minute', async () => {
      // Hit limit
      for (let i = 0; i < 5; i++) {
        await recordGenerationUsage(testUserId)
      }

      // Wait for minute to roll over
      await sleep(61000)

      // Should be allowed again
      const check = await checkAllRateLimits(testUserId)
      expect(check.allowed).toBe(true)
    })
  })

  describe('Daily Limits - Trial Users', () => {
    it('should allow up to 100 generations per day for trial users', async () => {
      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        const check = await checkAllRateLimits(trialUserId)
        expect(check.allowed).toBe(true)
        await recordGenerationUsage(trialUserId)
      }

      // 101st request should be blocked
      const check = await checkAllRateLimits(trialUserId)
      expect(check.allowed).toBe(false)
      expect(check.blockedBy).toBe('per_day')
      expect(check.perDay.upgradeRequired).toBe(true)
    })

    it('should indicate upgrade required for trial users', async () => {
      // Hit daily limit
      for (let i = 0; i < 100; i++) {
        await recordGenerationUsage(trialUserId)
      }

      const check = await checkAllRateLimits(trialUserId)
      expect(check.perDay.upgradeRequired).toBe(true)
      expect(check.perDay.isTrialUser).toBe(true)
      expect(check.perDay.message).toContain('Upgrade')
    })
  })

  describe('Daily Limits - Paid Users', () => {
    it('should have no daily limit for paid users', async () => {
      // Make 150 requests (well over trial limit)
      for (let i = 0; i < 150; i++) {
        const check = await checkAllRateLimits(paidUserId)
        
        // Only check per-minute limit (not daily)
        if (i % 5 === 0 && i > 0) {
          // Every 5 requests, wait a minute to avoid per-minute limit
          await sleep(61000)
        }
        
        expect(check.allowed).toBe(true)
        await recordGenerationUsage(paidUserId)
      }

      // Should still be allowed
      const check = await checkAllRateLimits(paidUserId)
      expect(check.perDay.limit).toBe(Number.MAX_SAFE_INTEGER)
    })
  })
})
```

---

## Database Queries

### Check Current Usage

```sql
-- Get user's current usage
SELECT 
  counter_type,
  count,
  period_start,
  CASE 
    WHEN counter_type = 'per_minute' THEN period_start + INTERVAL '1 minute'
    WHEN counter_type = 'per_day' THEN period_start + INTERVAL '1 day'
  END as resets_at
FROM usage_counters
WHERE user_id = 'user-uuid'
AND period_start >= NOW() - INTERVAL '1 day'
ORDER BY period_start DESC;
```

### Reset User's Counters (Admin Only)

```sql
-- Reset all counters for a user
DELETE FROM usage_counters
WHERE user_id = 'user-uuid';
```

### View Top Users by Usage

```sql
-- Top users by daily generations
SELECT 
  user_id,
  SUM(count) as total_generations
FROM usage_counters
WHERE counter_type = 'per_day'
AND period_start >= NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY total_generations DESC
LIMIT 10;
```

---

## Cleanup & Maintenance

### Automatic Cleanup

Old counters should be cleaned up periodically to prevent table bloat.

**Cron Job:**
```typescript
// cleanup-usage-counters.ts
import { cleanupOldCounters } from '@/lib/rate-limit'

async function main() {
  const deleted = await cleanupOldCounters()
  console.log(`Cleaned up ${deleted} old usage counters`)
}

main()
```

**SQL Function:**
```sql
CREATE OR REPLACE FUNCTION cleanup_old_usage_counters()
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  -- Delete per_minute counters older than 1 hour
  DELETE FROM usage_counters
  WHERE counter_type = 'per_minute'
  AND period_start < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete per_day counters older than 7 days
  DELETE FROM usage_counters
  WHERE counter_type = 'per_day'
  AND period_start < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

**Schedule:**
- Run daily at 00:00 UTC
- Keeps last 1 hour of per_minute counters
- Keeps last 7 days of per_day counters

---

## Configuration

### Adjusting Limits

To change rate limits, update `lib/rate-limit.ts`:

```typescript
export const RATE_LIMITS = {
  GENERATIONS_PER_MINUTE: 10,          // Change from 5 to 10
  TRIAL_GENERATIONS_PER_DAY: 200,      // Change from 100 to 200
  PAID_GENERATIONS_PER_DAY: Number.MAX_SAFE_INTEGER,
}
```

**Note:** Changes take effect immediately for new counters.

### Custom Limits Per Plan

For more granular control:

```typescript
// Get user's plan
const subscription = await getUserSubscription(userId)
const plan = await getPlan(subscription.plan_id)

// Apply plan-specific limits
let dailyLimit
switch (plan.id) {
  case 'starter':
    dailyLimit = 100
    break
  case 'pro':
    dailyLimit = 500
    break
  case 'brand':
    dailyLimit = 2000
    break
  default:
    dailyLimit = Number.MAX_SAFE_INTEGER
}
```

---

## Best Practices

### 1. Check Limits Early

```typescript
// Check limits BEFORE any expensive operations
const rateLimitCheck = await checkAllRateLimits(userId)

if (!rateLimitCheck.allowed) {
  return error response // Fast fail
}

// Continue with expensive operations
```

### 2. Provide Clear Feedback

```typescript
// Show remaining generations
const stats = await getUserUsageStats(userId)

toast.info(`You have ${stats.perDay.remaining} generations remaining today`)
```

### 3. Show Upgrade CTA Proactively

```typescript
// Warn when approaching limit
if (stats.perDay.remaining <= 10 && stats.perDay.isTrialUser) {
  showUpgradePrompt({
    message: 'Only 10 generations left today!',
    cta: 'Upgrade for unlimited',
  })
}
```

### 4. Handle Errors Gracefully

```typescript
try {
  const response = await fetch('/api/generate', ...)
  
  if (response.status === 429) {
    const data = await response.json()
    handleRateLimitError(data)
    return
  }
  
  // ... success handling
} catch (error) {
  // Generic error handling
}
```

---

## Monitoring

### Metrics to Track

1. **Rate Limit Hits**
   - Per-minute limit hits (abuse indicator)
   - Daily limit hits (upgrade opportunity)

2. **Conversion Metrics**
   - Users who hit daily limit
   - Users who upgrade after hitting limit
   - Time from limit to upgrade

3. **Usage Patterns**
   - Average generations per day by plan
   - Peak usage times
   - Users approaching limits

### Logging

```typescript
// Log rate limit hits
if (!rateLimitCheck.allowed) {
  console.log('Rate limit hit', {
    userId,
    type: rateLimitCheck.blockedBy,
    isTrialUser: blockedLimit.isTrialUser,
    current: blockedLimit.current,
    limit: blockedLimit.limit,
  })
}
```

---

## Troubleshooting

### Issue: User says they hit limit but shouldn't have

**Check:**
```sql
SELECT * FROM usage_counters
WHERE user_id = 'user-uuid'
AND period_start >= NOW() - INTERVAL '1 day';
```

**Solution:**
- Verify subscription status
- Check if limit calculation is correct
- Manually reset counters if needed

### Issue: Counters not resetting

**Check:**
```sql
SELECT * FROM usage_counters
WHERE period_start < NOW() - INTERVAL '1 day'
ORDER BY period_start DESC
LIMIT 10;
```

**Solution:**
- Run cleanup function
- Verify period_start calculations
- Check system time

### Issue: Paid users hitting daily limit

**Check:**
```typescript
const subscription = await getUserSubscription(userId)
console.log(subscription.status) // Should be 'active'
```

**Solution:**
- Verify subscription status is 'active'
- Check subscription hasn't expired
- Update rate limit logic if needed

---

## Security Considerations

### Prevent Bypass Attempts

1. **Server-Side Only**
   - All checks happen server-side
   - No client-side bypass possible

2. **Database-Backed**
   - Counters stored in database
   - Atomic increments
   - Race condition protection

3. **User-Specific**
   - Counters tied to authenticated user_id
   - Can't bypass by changing IP/cookies

### Rate Limit Evasion

**Potential Issues:**
- Multiple accounts per user
- Shared accounts
- API key abuse

**Mitigations:**
- Email verification required
- Credit card validation for paid plans
- IP-based monitoring (optional)
- Account flagging system

---

## Conclusion

The rate limiting system provides:

- ✅ **Abuse Prevention** - Per-minute limits for all users
- ✅ **Fair Usage** - Daily limits for trial users
- ✅ **Monetization** - Upgrade incentive at daily limit
- ✅ **Flexibility** - Subscription-based limits
- ✅ **User-Friendly** - Clear messages and CTAs
- ✅ **Production-Ready** - Database-backed, tested, scalable

Adjust limits as needed based on usage patterns and business needs.

---

**For support:** See [Generate API](./GENERATE_API.md) for integration details.
