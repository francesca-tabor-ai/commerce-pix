# Rate Limiting Implementation

## Overview

Commerce PIX implements **comprehensive rate limiting** to prevent abuse and ensure fair usage. Rate limits are enforced per-user with both **per-minute** and **per-day** counters stored in Supabase.

---

## Rate Limits

### Current Limits

| Limit Type | Value | Description |
|------------|-------|-------------|
| **Per Minute** | 5 generations | Maximum generations allowed within a 1-minute window |
| **Per Day** | 50 generations | Maximum generations allowed within a 24-hour period (free tier) |

### Configuration

Limits are defined in `lib/rate-limit.ts`:

```typescript
export const RATE_LIMITS = {
  GENERATIONS_PER_MINUTE: 5,
  GENERATIONS_PER_DAY: 50, // Free tier placeholder
} as const
```

---

## Database Schema

### `usage_counters` Table

```sql
CREATE TABLE public.usage_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  counter_type TEXT NOT NULL CHECK (counter_type IN ('per_minute', 'per_day')),
  count INT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Fields**:
- `id` - Unique identifier
- `user_id` - References auth.users (cascades on delete)
- `counter_type` - Either 'per_minute' or 'per_day'
- `count` - Current usage count for this period
- `period_start` - Start of the current period (rounded to minute or day)
- `created_at` - Record creation timestamp
- `updated_at` - Last update timestamp (auto-updated via trigger)

**Indexes**:
- `idx_usage_counters_user_type` (UNIQUE) - `(user_id, counter_type, period_start)`
- `idx_usage_counters_user_id` - `(user_id)`
- `idx_usage_counters_period_start` - `(period_start)` for cleanup

**RLS Policies**:
- Users can only read/write their own counters
- All operations require authentication
- Based on `auth.uid() = user_id`

---

## Implementation

### Rate Limiting Flow

```
1. Request to /api/generate
      ↓
2. Authenticate user (requireUser)
      ↓
3. Check rate limits (checkAllRateLimits)
      ├─ Check per-minute counter
      └─ Check per-day counter
      ↓
4. If limit exceeded:
   - Return 429 error
   - Include reset time
   - Send Retry-After header
      ↓
5. If within limit:
   - Process generation
   - Record usage (increment both counters)
   - Return success with updated limits
```

### Key Functions

**File**: `lib/rate-limit.ts`

#### `checkAllRateLimits(userId: string)`

Checks both per-minute and per-day limits for a user.

**Returns**:
```typescript
{
  allowed: boolean
  perMinute: RateLimitResult
  perDay: RateLimitResult
  blockedBy?: 'per_minute' | 'per_day'
}
```

#### `recordGenerationUsage(userId: string)`

Increments both per-minute and per-day counters for a user.

Called AFTER successful job creation.

#### `getUserUsageStats(userId: string)`

Gets current usage statistics for a user.

**Returns**:
```typescript
{
  perMinute: { current, limit, remaining }
  perDay: { current, limit, remaining }
}
```

#### `cleanupOldCounters()`

Removes expired counters:
- per_minute: older than 2 minutes
- per_day: older than 2 days

Should be run periodically via cron job.

---

## API Integration

### `/api/generate` Endpoint

**Rate Limit Check** (before processing):
```typescript
const rateLimitCheck = await checkAllRateLimits(user.id)

if (!rateLimitCheck.allowed) {
  return NextResponse.json(
    { 
      error: 'Rate limit exceeded',
      message: blockedLimit.message,
      rateLimit: { type, limit, current, remaining, resetAt }
    },
    { 
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(remaining),
        'X-RateLimit-Reset': resetAt.toISOString(),
        'Retry-After': String(seconds),
      }
    }
  )
}
```

**Record Usage** (after successful job creation):
```typescript
await recordGenerationUsage(user.id)
```

**Response** (success):
```json
{
  "job": {...},
  "message": "Generation job created and processing",
  "rateLimit": {
    "perMinute": {
      "current": 2,
      "limit": 5,
      "remaining": 3
    },
    "perDay": {
      "current": 15,
      "limit": 50,
      "remaining": 35
    }
  }
}
```

**Response** (rate limit exceeded):
```json
{
  "error": "Rate limit exceeded",
  "message": "You've used 5/5 generations this minute. Try again in 37 seconds.",
  "rateLimit": {
    "type": "per_minute",
    "limit": 5,
    "current": 5,
    "remaining": 0,
    "resetAt": "2026-01-05T01:24:00.000Z"
  }
}
```

### `/api/rate-limit/status` Endpoint

**GET** endpoint to check current rate limit status.

**Response**:
```json
{
  "perMinute": {
    "current": 2,
    "limit": 5,
    "remaining": 3
  },
  "perDay": {
    "current": 15,
    "limit": 50,
    "remaining": 35
  },
  "limits": {
    "generationsPerMinute": 5,
    "generationsPerDay": 50
  }
}
```

---

## Period Calculation

### Per-Minute Period

Rounded down to the current minute:

```typescript
const now = new Date()
const periodStart = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate(),
  now.getHours(),
  now.getMinutes(),
  0, 0
)
// Example: 2026-01-05 01:23:45 → 2026-01-05 01:23:00
```

Reset time: Start of next minute

### Per-Day Period

Rounded down to start of day (UTC):

```typescript
const now = new Date()
const periodStart = new Date(Date.UTC(
  now.getUTCFullYear(),
  now.getUTCMonth(),
  now.getUTCDate(),
  0, 0, 0, 0
))
// Example: 2026-01-05 15:30:00 → 2026-01-05 00:00:00 UTC
```

Reset time: Start of next day (UTC)

---

## UI Integration

### Rate Limit Status Display

The API test page (`/api-test`) shows real-time rate limit status:

**Display**:
- Current usage vs limit for per-minute
- Current usage vs limit for per-day
- Remaining generations for each period
- Refresh button to update status

**Auto-refresh**:
- Status loads on page load
- Updates after each generation
- Can be manually refreshed

**Error Display**:
- Shows rate limit type that blocked request
- Displays reset time
- Includes retry-after information

---

## Error Messages

### Per-Minute Limit Exceeded

```
Rate limit exceeded. You've used 5/5 generations this minute. Try again in 45 seconds.
```

### Per-Day Limit Exceeded

```
Rate limit exceeded. You've used 50/50 generations today. Try again in 8 hours.
```

---

## HTTP Headers

### Rate Limit Response Headers

All responses from `/api/generate` include:

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 2026-01-05T01:24:00.000Z
```

### 429 Response Headers

When rate limited (429 status):

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-01-05T01:24:00.000Z
Retry-After: 45
```

---

## Maintenance

### Cleanup Old Counters

Run periodically (recommended: hourly):

```typescript
import { cleanupOldCounters } from '@/lib/rate-limit'

const deletedCount = await cleanupOldCounters()
console.log(`Cleaned up ${deletedCount} old counters`)
```

Or via SQL:

```sql
SELECT cleanup_old_usage_counters();
```

### Monitor Usage

**Count active counters**:
```sql
SELECT 
  counter_type,
  COUNT(*) as active_counters,
  AVG(count) as avg_usage,
  MAX(count) as max_usage
FROM usage_counters
WHERE period_start > NOW() - INTERVAL '1 hour'
GROUP BY counter_type;
```

**Find heavy users**:
```sql
SELECT 
  user_id,
  SUM(count) as total_generations,
  MAX(count) as max_per_period
FROM usage_counters
WHERE counter_type = 'per_day'
AND period_start > NOW() - INTERVAL '7 days'
GROUP BY user_id
ORDER BY total_generations DESC
LIMIT 10;
```

---

## Testing

### Test Rate Limiting

1. Navigate to `/api-test`
2. Check rate limit status (should show 0/5 and 0/50)
3. Upload an input image
4. Trigger 5 generations within 1 minute
5. 6th generation should return 429 error
6. Wait 1 minute and try again (should succeed)

### Expected Behavior

**Generation 1-5**:
- HTTP 200
- Job created successfully
- Rate limit info shows: 1/5, 2/5, 3/5, 4/5, 5/5

**Generation 6 (same minute)**:
- HTTP 429
- Error: "Rate limit exceeded"
- Message: "You've used 5/5 generations this minute. Try again in X seconds"
- Retry-After header present

**After 1 minute**:
- Counter resets
- Generation succeeds
- Rate limit info shows: 1/5 (new period)

---

## Security

### Why Database-Backed?

1. **Accurate** - Shared state across all server instances
2. **Persistent** - Survives server restarts
3. **Scalable** - Works with multiple servers/containers
4. **Auditable** - Full history of usage in database

### Protection Against

- ✅ **API Abuse** - Prevents spamming generation endpoint
- ✅ **Cost Control** - Limits OpenAI API costs per user
- ✅ **Fair Usage** - Ensures equitable resource distribution
- ✅ **DoS Attacks** - Mitigates denial-of-service attempts

### Bypass Prevention

- Server-side only (no client control)
- Checked before any processing
- Usage recorded after job creation
- RLS policies prevent tampering

---

## Future Enhancements

### 1. Tiered Limits

Different limits for different user tiers:

```typescript
export const RATE_LIMITS = {
  FREE: {
    GENERATIONS_PER_MINUTE: 5,
    GENERATIONS_PER_DAY: 50,
  },
  PRO: {
    GENERATIONS_PER_MINUTE: 20,
    GENERATIONS_PER_DAY: 500,
  },
  ENTERPRISE: {
    GENERATIONS_PER_MINUTE: 100,
    GENERATIONS_PER_DAY: 5000,
  },
}
```

### 2. Burst Allowance

Allow short bursts above limit:

```typescript
export const RATE_LIMITS = {
  GENERATIONS_PER_MINUTE: 5,
  BURST_ALLOWANCE: 10, // Allow up to 10 in first minute
  BURST_RECOVERY: 1,    // Recover 1 burst token per minute
}
```

### 3. Dynamic Limits

Adjust based on system load or time of day:

```typescript
function getLimit(userId: string, timeOfDay: number) {
  if (isOffPeak(timeOfDay)) {
    return RATE_LIMITS.GENERATIONS_PER_MINUTE * 2
  }
  return RATE_LIMITS.GENERATIONS_PER_MINUTE
}
```

### 4. Cost-Based Limiting

Limit by cost instead of count:

```typescript
export const RATE_LIMITS = {
  COST_PER_DAY_CENTS: 100, // $1.00 per day
}
```

Track actual OpenAI API costs and limit when threshold reached.

---

## Migration File

**Location**: `supabase/migrations/20260105000000_create_usage_counters_table.sql`

**To Apply**:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Paste migration SQL
4. Execute

---

## Related Documentation

- [API Documentation](./API_DOCUMENTATION.md) - API endpoints
- [Database Schema](./DATABASE_SCHEMA.md) - Database tables

---

**Status**: ✅ Implemented  
**Last Updated**: 2026-01-05  
**Version**: 1.0

