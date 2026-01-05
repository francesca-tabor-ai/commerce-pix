# Upgrade Paywall System Documentation

Comprehensive paywall system to encourage upgrades when users hit limits or their plan expires.

## Overview

The upgrade paywall system consists of three main components:

1. **UpgradeModal** - Full-screen modal dialog for critical upgrade prompts
2. **InlineUpgradeCard** - Embedded card component for inline upgrade prompts
3. **useUpgradePrompt** - React hook for managing upgrade prompt state

---

## Components

### 1. UpgradeModal

Full-screen modal dialog that shows upgrade options with featured plans.

#### Usage

```tsx
import { UpgradeModal } from '@/components/billing/UpgradeModal'

function MyComponent() {
  const [showModal, setShowModal] = useState(false)

  return (
    <UpgradeModal
      open={showModal}
      onOpenChange={setShowModal}
      reason="no_credits"
      resetTime={null}
    />
  )
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `open` | `boolean` | Controls modal visibility |
| `onOpenChange` | `(open: boolean) => void` | Callback when modal should open/close |
| `reason` | `UpgradeReason` | Why upgrade is needed |
| `resetTime` | `string \| null` | Optional reset time (for rate limits) |

#### Supported Reasons

| Reason | Icon | Description |
|--------|------|-------------|
| `no_credits` | ⚡ Zap (amber) | User has 0 credits remaining |
| `trial_ended` | 📈 TrendingUp (primary) | Free trial has expired |
| `feature_locked` | ✨ Sparkles (primary) | Feature requires paid plan |
| `plan_canceled` | ⚠️ AlertTriangle (destructive) | Subscription was canceled |
| `rate_limit_exceeded` | ⏰ Clock (amber) | Hit daily/per-minute generation limit |

#### Features

- Shows 2 featured plans (Pro and Brand)
- Displays plan features with checkmarks
- "Most Popular" badge on Pro plan
- "View All Plans" button
- Routes to `/app/billing` on plan selection
- 14-day money-back guarantee message
- Responsive design (mobile-friendly)

---

### 2. InlineUpgradeCard

Embedded card component for inline upgrade prompts (less intrusive than modal).

#### Usage

```tsx
import { InlineUpgradeCard } from '@/components/billing/InlineUpgradeCard'

// Compact version (single row)
<InlineUpgradeCard 
  reason="no_credits"
  compact
/>

// Full version (with plan details)
<InlineUpgradeCard 
  reason="rate_limit_exceeded"
  resetTime="2026-01-05T15:30:00Z"
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `reason` | `UpgradeReason` | required | Why upgrade is needed |
| `resetTime` | `string \| null` | `null` | Optional reset time (for rate limits) |
| `className` | `string` | `''` | Additional CSS classes |
| `compact` | `boolean` | `false` | Use compact single-row layout |

#### Layouts

**Compact Mode** (`compact={true}`):
```
┌────────────────────────────────────────────────┐
│ [Icon] Title                    [Upgrade Button]│
│        Description                              │
└────────────────────────────────────────────────┘
```

**Full Mode** (`compact={false}`):
```
┌────────────────────────────────────────────────┐
│                    [Icon]                       │
│                     Title                       │
│                  Description                    │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ Pro Plan - $49/month                     │  │
│  │ ✓ Feature 1                              │  │
│  │ ✓ Feature 2                              │  │
│  │ [Upgrade to Pro Button]                  │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [View All Plans Button]                        │
└────────────────────────────────────────────────┘
```

#### Styling

Each reason has custom styling:

| Reason | Icon Color | Background | Border |
|--------|-----------|------------|--------|
| `no_credits` | `text-amber-500` | `bg-amber-500/10` | `border-amber-500/20` |
| `plan_canceled` | `text-destructive` | `bg-destructive/10` | `border-destructive/20` |
| `rate_limit_exceeded` | `text-amber-500` | `bg-amber-500/10` | `border-amber-500/20` |
| `trial_ended` | `text-primary` | `bg-primary/10` | `border-primary/20` |

---

### 3. useUpgradePrompt Hook

React hook for managing upgrade prompt state throughout the application.

#### Basic Usage

```tsx
'use client'

import { useUpgradePrompt } from '@/hooks/useUpgradePrompt'

function GenerateButton() {
  const { showUpgrade, UpgradePrompt } = useUpgradePrompt()

  const handleGenerate = async () => {
    const response = await fetch('/api/generate', { ... })
    const data = await response.json()

    if (response.status === 402) {
      // No credits
      showUpgrade('no_credits')
      return
    }

    if (response.status === 429) {
      // Rate limit
      showUpgrade('rate_limit_exceeded', data.rateLimit.resetAt)
      return
    }

    // Success...
  }

  return (
    <>
      <button onClick={handleGenerate}>Generate</button>
      <UpgradePrompt />
    </>
  )
}
```

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `showUpgrade` | `(reason, resetTime?) => void` | Show upgrade modal |
| `hideUpgrade` | `() => void` | Hide upgrade modal |
| `UpgradePrompt` | `React.Component` | Modal component to render |
| `isOpen` | `boolean` | Current modal state |
| `reason` | `UpgradeReason` | Current reason |

---

### 4. useUpgradeFromError Hook

Helper hook to automatically show upgrade prompts based on API error responses.

#### Usage

```tsx
'use client'

import { useUpgradeFromError } from '@/hooks/useUpgradePrompt'

function MyComponent() {
  const checkError = useUpgradeFromError()

  const handleAction = async () => {
    try {
      const response = await fetch('/api/generate')
      const data = await response.json()

      if (!response.ok) {
        // Automatically shows upgrade modal if needed
        const handled = checkError(data)
        
        if (handled) {
          return // Upgrade modal shown
        }
        
        // Handle other errors
        toast.error(data.error)
      }
    } catch (error) {
      console.error(error)
    }
  }

  return <button onClick={handleAction}>Action</button>
}
```

#### Detected Error Codes

| Error Code | Trigger | Upgrade Reason |
|------------|---------|----------------|
| `NO_CREDITS` | Insufficient credits | `no_credits` |
| `UPGRADE_REQUIRED` | Rate limit exceeded | `rate_limit_exceeded` |
| `PLAN_CANCELED` | Subscription canceled | `plan_canceled` |
| `TRIAL_ENDED` | Trial expired | `trial_ended` |

---

## Trigger Scenarios

### 1. Credits = 0

**When:** User attempts generation with 0 credits

**API Response:**
```json
{
  "error": "Insufficient credits",
  "code": "NO_CREDITS"
}
```

**Component:**
```tsx
// Dashboard - Show inline card
<InlineUpgradeCard reason="no_credits" compact />

// Generation flow - Show modal
showUpgrade('no_credits')
```

**User Flow:**
1. User clicks "Generate"
2. API returns 402 status
3. Modal appears: "Out of Credits"
4. Shows Pro and Brand plans
5. User clicks "Upgrade to Pro"
6. Routes to `/app/billing`

---

### 2. Plan Canceled

**When:** User with canceled subscription tries to generate

**Check:**
```tsx
const subscription = await getUserSubscription(userId)

if (subscription?.status === 'canceled') {
  // Show upgrade prompt
}
```

**Component:**
```tsx
<InlineUpgradeCard reason="plan_canceled" />
```

**User Flow:**
1. User's subscription is canceled
2. Dashboard shows inline upgrade card
3. "Plan Canceled - Reactivate to continue"
4. User clicks "Upgrade"
5. Routes to `/app/billing`

---

### 3. Rate Limit Exceeded

**When:** User hits per-minute (5 gens) or daily limit (100 for trial)

**API Response:**
```json
{
  "error": "Rate limit exceeded",
  "code": "UPGRADE_REQUIRED",
  "rateLimit": {
    "type": "per_day",
    "limit": 100,
    "current": 100,
    "remaining": 0,
    "resetAt": "2026-01-06T00:00:00Z",
    "upgradeRequired": true,
    "isTrialUser": true
  }
}
```

**Component:**
```tsx
showUpgrade('rate_limit_exceeded', data.rateLimit.resetAt)
```

**User Flow:**
1. Trial user generates 100th image today
2. 101st generation attempt returns 429
3. Modal appears: "Rate Limit Reached"
4. Shows reset time: "Wait until 12:00 AM or upgrade"
5. Shows Pro plan with "Unlimited daily generations"
6. User clicks "Upgrade to Pro"
7. Routes to `/app/billing`

---

## Integration Examples

### Dashboard Integration

```tsx
// app/app/page.tsx
import { InlineUpgradeCard } from '@/components/billing/InlineUpgradeCard'
import { getUserSubscription } from '@/lib/db/billing'

export default async function DashboardPage() {
  const user = await requireUser()
  const [stats, subscription] = await Promise.all([
    getDashboardStats(user.id),
    getUserSubscription(user.id)
  ])

  const shouldShowUpgrade = 
    stats.creditBalance === 0 || 
    subscription?.status === 'canceled'

  const getReason = () => {
    if (stats.creditBalance === 0) return 'no_credits'
    if (subscription?.status === 'canceled') return 'plan_canceled'
    return 'no_credits'
  }

  return (
    <div>
      <h1>Dashboard</h1>
      
      {shouldShowUpgrade && (
        <InlineUpgradeCard reason={getReason()} compact />
      )}
      
      {/* Rest of dashboard */}
    </div>
  )
}
```

### Generation Flow Integration

```tsx
// components/workspace/GenerateButton.tsx
'use client'

import { useUpgradePrompt } from '@/hooks/useUpgradePrompt'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function GenerateButton({ projectId, inputAssetId, mode }) {
  const { showUpgrade, UpgradePrompt } = useUpgradePrompt()
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, inputAssetId, mode })
      })

      const data = await response.json()

      // Check for upgrade scenarios
      if (response.status === 402 && data.code === 'NO_CREDITS') {
        showUpgrade('no_credits')
        return
      }

      if (response.status === 429 && data.code === 'UPGRADE_REQUIRED') {
        showUpgrade('rate_limit_exceeded', data.rateLimit?.resetAt)
        return
      }

      if (!response.ok) {
        toast.error(data.error)
        return
      }

      // Success
      toast.success('Generation started!')
    } catch (error) {
      toast.error('Failed to generate')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating...' : 'Generate'}
      </Button>
      
      <UpgradePrompt />
    </>
  )
}
```

### Project Page Integration

```tsx
// app/app/projects/[id]/page.tsx
import { InlineUpgradeCard } from '@/components/billing/InlineUpgradeCard'

export default async function ProjectPage({ params }) {
  const user = await requireUser()
  const [credits, subscription] = await Promise.all([
    getCreditBalance(user.id),
    getUserSubscription(user.id)
  ])

  const canGenerate = 
    credits > 0 && 
    subscription?.status !== 'canceled'

  return (
    <div>
      {!canGenerate && (
        <InlineUpgradeCard 
          reason={credits === 0 ? 'no_credits' : 'plan_canceled'}
        />
      )}
      
      <GenerateWorkspace />
    </div>
  )
}
```

---

## Best Practices

### 1. When to Use Modal vs Inline Card

**Use Modal (`UpgradeModal`):**
- User attempts an action (generate, download, etc.)
- Critical blocker (can't proceed without upgrade)
- Immediate feedback needed
- Mid-workflow interruption

**Use Inline Card (`InlineUpgradeCard`):**
- Dashboard or page-level warnings
- Proactive upgrade prompts
- Non-blocking information
- Persistent reminders

### 2. Compact vs Full Layout

**Use Compact (`compact={true}`):**
- Limited space (dashboard, sidebar)
- Multiple cards on same page
- Quick glance information
- Mobile-first design

**Use Full (`compact={false}`):**
- Dedicated upgrade page
- Empty state replacements
- Detailed feature comparison
- Desktop-focused layout

### 3. Error Handling

Always handle upgrade scenarios gracefully:

```tsx
// ✅ Good
const response = await fetch('/api/generate')
const data = await response.json()

if (response.status === 402) {
  showUpgrade('no_credits')
  return
}

// ❌ Bad
const response = await fetch('/api/generate')
if (!response.ok) {
  throw new Error('Failed') // User doesn't know why
}
```

### 4. User Experience

- Show reset times for rate limits
- Explain why upgrade is needed
- Provide clear CTA buttons
- Route directly to billing page
- Include money-back guarantee message

---

## Styling Customization

All components use Tailwind CSS and can be customized:

```tsx
// Custom styling
<InlineUpgradeCard 
  reason="no_credits"
  className="my-8 shadow-xl"
  compact
/>
```

**Available CSS variables:**
- `--primary` - Primary brand color
- `--destructive` - Error/danger color
- `--amber-500` - Warning color
- `--muted-foreground` - Secondary text

---

## Testing

### Test Scenarios

1. **Zero Credits:**
   ```
   - Set user credits to 0
   - Attempt generation
   - Verify modal appears with "Out of Credits"
   - Click "Upgrade to Pro"
   - Verify routes to /app/billing
   ```

2. **Plan Canceled:**
   ```
   - Cancel user subscription
   - Load dashboard
   - Verify inline card appears
   - Verify "Plan Canceled" message
   ```

3. **Rate Limit (Per-Minute):**
   ```
   - Generate 5 images in < 1 minute
   - Attempt 6th generation
   - Verify 429 error with rate limit info
   - Verify modal shows reset time
   ```

4. **Rate Limit (Daily - Trial):**
   ```
   - Trial user generates 100 images today
   - Attempt 101st generation
   - Verify modal shows "Upgrade for unlimited"
   - Verify reset time displayed
   ```

---

## API Integration

### Generation Endpoint Response

```typescript
// Success (200)
{
  jobId: string
  message: string
}

// No Credits (402)
{
  error: "Insufficient credits",
  code: "NO_CREDITS"
}

// Rate Limit (429)
{
  error: "Rate limit exceeded",
  code: "UPGRADE_REQUIRED",
  message: "You've reached your daily limit of 100 generations...",
  rateLimit: {
    type: "per_day",
    limit: 100,
    current: 100,
    remaining: 0,
    resetAt: "2026-01-06T00:00:00Z",
    isPerMinuteLimit: false,
    isDailyLimit: true,
    upgradeRequired: true,
    isTrialUser: true
  }
}
```

---

## Future Enhancements

- [ ] A/B testing different upgrade messages
- [ ] Personalized plan recommendations
- [ ] "Try one more generation" button (bonus credit)
- [ ] Annual billing discount promotion
- [ ] Referral program integration
- [ ] Usage analytics dashboard
- [ ] Countdown timer for rate limit reset
- [ ] "Almost out" early warnings (5 credits left)
- [ ] Custom branding per plan tier
- [ ] Testimonials in upgrade modal

---

## Summary

The upgrade paywall system provides:

✅ **Modal + Inline Components** - Use right component for context  
✅ **5 Trigger Reasons** - Cover all upgrade scenarios  
✅ **React Hook** - Easy integration throughout app  
✅ **Automatic Error Detection** - Parse API responses  
✅ **Responsive Design** - Mobile and desktop  
✅ **Clear CTAs** - Route to billing page  
✅ **Professional UI** - Shadcn/ui components  
✅ **TypeScript** - Fully typed  
✅ **Documentation** - Comprehensive guide  

**Result:** Increased conversion rates from trial to paid plans with professional, user-friendly upgrade prompts.

