# Admin Dashboard Documentation

Internal analytics and system monitoring dashboard for administrators.

## Overview

The admin dashboard provides key metrics and insights into system usage, user distribution, and recent activity. Access is restricted to authorized administrators only.

---

## Access Control

### Environment Variable

Access to the admin dashboard is controlled by the `ADMIN_EMAILS` environment variable.

**Format:** Comma-separated list of email addresses

```bash
# .env.local
ADMIN_EMAILS=admin@company.com,manager@company.com,analytics@company.com
```

### Authorization Flow

1. User must be authenticated (logged in)
2. User's email is checked against `ADMIN_EMAILS` list
3. Case-insensitive matching
4. If not authorized, user is redirected to `/app`
5. Unauthorized access attempts are logged to console

### Helper Functions

```typescript
// lib/auth/admin.ts

// Require admin access (redirects if unauthorized)
await requireAdmin()

// Check admin status without redirecting
const isUserAdmin = await isAdmin() // returns boolean
```

---

## Dashboard Sections

### 1. Stats Cards

**Total Users**
- Count of all registered user accounts
- Includes all profiles in the system
- Icon: Users

**Total Generations**
- Count of all AI-generated images
- Queries: `assets` table where `kind='output'`
- Icon: Image

**Average per User**
- Total Generations / Total Users
- Metric for user engagement
- Icon: TrendingUp

### 2. Plan Distribution

Visualizes how users are distributed across subscription plans.

**Data Includes:**
- Each plan name (Starter, Pro, Brand, Agency, Enterprise)
- Number of users on each plan
- Percentage of total users
- "No Plan" category for users without subscriptions

**Calculation:**
- Counts active subscriptions per plan
- Excludes canceled/expired subscriptions
- Includes: `active`, `trialing`, `past_due` statuses

**Visual:**
- Horizontal bar chart
- Progress bar showing percentage
- Sorted by plan price (lowest to highest)

### 3. Recent Generation Jobs

Table of the last 20 generation jobs with full details.

**Columns:**

| Column | Description |
|--------|-------------|
| **Status** | Badge with icon (Succeeded, Failed, Running, Queued) |
| **User** | User's email address |
| **Project** | Project name (or "N/A") |
| **Mode** | Generation mode (main_white, lifestyle, etc.) |
| **Created** | Relative time (e.g., "5 minutes ago") |
| **Duration** | Time taken in seconds (or "-" if incomplete) |
| **Error** | Error message if failed (truncated) |

**Status Badges:**

| Status | Badge | Icon | Color |
|--------|-------|------|-------|
| `succeeded` | Succeeded | CheckCircle2 | Green |
| `failed` | Failed | XCircle | Red |
| `running` | Running | Activity | Secondary |
| `queued` | Queued | Clock | Outline |

**Features:**
- Real-time data (no caching)
- Sorted by most recent first
- Email and project name resolution
- Duration calculation
- Error message display

---

## API Functions

### `lib/db/admin-stats.ts`

#### `getTotalUsers(): Promise<number>`

Returns count of all users in the system.

```typescript
const totalUsers = await getTotalUsers()
// Returns: 1234
```

#### `getTotalGenerations(): Promise<number>`

Returns count of all generated images (output assets).

```typescript
const totalGenerations = await getTotalGenerations()
// Returns: 5678
```

#### `getPlanDistribution(): Promise<PlanDistribution[]>`

Returns array of plan distribution data.

```typescript
const distribution = await getPlanDistribution()
// Returns:
// [
//   { planName: "Starter", userCount: 50, percentage: 45.5 },
//   { planName: "Pro", userCount: 40, percentage: 36.4 },
//   { planName: "Brand", userCount: 20, percentage: 18.1 }
// ]
```

#### `getRecentGenerationJobs(limit): Promise<GenerationJobSummary[]>`

Returns array of recent generation jobs with details.

```typescript
const recentJobs = await getRecentGenerationJobs(20)
// Returns array of:
// {
//   id: "uuid",
//   user_email: "user@example.com",
//   status: "succeeded",
//   mode: "main_white",
//   created_at: "2026-01-05T10:30:00Z",
//   completed_at: "2026-01-05T10:30:15Z",
//   error_message: null,
//   project_name: "My Project"
// }
```

#### `getAdminStats(): Promise<AdminStats>`

Convenience function that fetches all stats at once.

```typescript
const stats = await getAdminStats()
// Returns:
// {
//   totalUsers: 1234,
//   totalGenerations: 5678,
//   planDistribution: [...]
// }
```

---

## Usage

### Accessing the Dashboard

1. **Log in** as an admin user (email in `ADMIN_EMAILS`)
2. Navigate to `/app/admin`
3. View metrics and recent activity

### Adding Admin Users

Update the `ADMIN_EMAILS` environment variable:

```bash
# Add new admin
ADMIN_EMAILS=existing@admin.com,new@admin.com

# Restart the application
npm run dev
```

### Removing Admin Access

Remove email from `ADMIN_EMAILS` and restart the application.

---

## Security

### Access Control

- ✅ Server-side enforcement via `requireAdmin()`
- ✅ Cannot be bypassed client-side
- ✅ Redirects unauthorized users
- ✅ Logs unauthorized access attempts
- ✅ Email matching is case-insensitive

### Data Privacy

- Admin sees all user emails in generation jobs table
- Admin can view system-wide statistics
- No password or payment information exposed
- No ability to modify user data (read-only)

### Best Practices

1. **Limit admin access** to trusted personnel only
2. **Use company email addresses** for admins
3. **Regularly audit** `ADMIN_EMAILS` list
4. **Monitor access logs** for unauthorized attempts
5. **Use secure channels** to share admin credentials

---

## Troubleshooting

### "Unauthorized" or Redirected to /app

**Problem:** User is redirected from `/app/admin` to `/app`

**Solutions:**
1. Check user's email matches one in `ADMIN_EMAILS` exactly
2. Verify `ADMIN_EMAILS` is set in environment variables
3. Ensure case-insensitive matching (emails are lowercased)
4. Restart Next.js dev server after changing env vars
5. Check server logs for "Unauthorized admin access attempt" message

### Stats Not Loading

**Problem:** Dashboard loads but shows 0 or no data

**Solutions:**
1. Check database connection (Supabase)
2. Verify tables exist: `profiles`, `assets`, `subscriptions`, `plans`, `generation_jobs`
3. Check RLS policies allow admin user to read data
4. Review server logs for database errors

### Generation Jobs Missing User Emails

**Problem:** "Unknown" appears in User column

**Causes:**
- User deleted from auth system
- Supabase admin API not accessible
- User ID doesn't match any auth user

**Fix:**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check admin API permissions

---

## Future Enhancements

### Planned Features

- [ ] Date range filters (last 7 days, 30 days, etc.)
- [ ] Export stats to CSV
- [ ] User search and details view
- [ ] Real-time updates (auto-refresh)
- [ ] Error rate metrics
- [ ] Revenue analytics
- [ ] System health indicators
- [ ] User activity timelines
- [ ] Top users by generation count
- [ ] Failed job analysis
- [ ] Rate limit metrics

### Advanced Analytics

- [ ] Daily/weekly/monthly trends
- [ ] Cohort analysis
- [ ] Churn prediction
- [ ] Feature usage tracking
- [ ] API performance metrics
- [ ] Credit consumption patterns

---

## API Reference

### Server Component

```tsx
// app/app/admin/page.tsx
import { requireAdmin } from '@/lib/auth/admin'
import { getAdminStats, getRecentGenerationJobs } from '@/lib/db/admin-stats'

export default async function AdminPage() {
  // Require admin access (redirects if unauthorized)
  const user = await requireAdmin()

  // Fetch stats
  const [stats, recentJobs] = await Promise.all([
    getAdminStats(),
    getRecentGenerationJobs(20),
  ])

  // Render dashboard
  return <Dashboard stats={stats} jobs={recentJobs} />
}
```

### Authorization Helper

```typescript
// Require admin (redirects)
import { requireAdmin } from '@/lib/auth/admin'
const user = await requireAdmin()

// Check admin status (no redirect)
import { isAdmin } from '@/lib/auth/admin'
const isUserAdmin = await isAdmin()

if (isUserAdmin) {
  // Show admin features
}
```

---

## Environment Setup

### Required Environment Variables

```bash
# Admin Access
ADMIN_EMAILS=admin1@company.com,admin2@company.com

# Supabase (for data access)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for generation context)
OPENAI_API_KEY=your_openai_key
```

### Local Development

```bash
# 1. Copy .env.example to .env.local
cp .env.example .env.local

# 2. Add your admin email
ADMIN_EMAILS=your@email.com

# 3. Start dev server
npm run dev

# 4. Navigate to http://localhost:3000/app/admin
```

### Production

```bash
# Set environment variable in hosting platform
# Vercel: Settings → Environment Variables
# Add ADMIN_EMAILS with production admin emails
```

---

## Testing

### Manual Testing

1. **Authorized Access:**
   ```
   - Set ADMIN_EMAILS to your email
   - Log in with that email
   - Navigate to /app/admin
   - Verify dashboard loads with data
   ```

2. **Unauthorized Access:**
   ```
   - Set ADMIN_EMAILS to different email
   - Log in with your email
   - Try to navigate to /app/admin
   - Verify redirect to /app
   - Check console for "Unauthorized" log
   ```

3. **Stats Accuracy:**
   ```
   - Create test users
   - Generate test images
   - Check Total Users count
   - Check Total Generations count
   - Verify math is correct
   ```

4. **Recent Jobs:**
   ```
   - Trigger new generation
   - Refresh admin dashboard
   - Verify job appears in table
   - Check status badge is correct
   - Verify duration calculation
   ```

---

## Summary

The admin dashboard provides:

✅ **Secure access control** via `ADMIN_EMAILS` env var  
✅ **Key metrics** (users, generations, averages)  
✅ **Plan distribution** visualization  
✅ **Recent activity** monitoring (last 20 jobs)  
✅ **Real-time data** (no caching)  
✅ **User details** in generation jobs  
✅ **Error tracking** with messages  
✅ **Professional UI** with shadcn/ui  
✅ **Server-side enforcement** (secure)  
✅ **TypeScript typed** (type-safe)  

**Purpose:** MVP analytics for internal monitoring and system health tracking.

**Next Steps:** Deploy to production and add admin emails to environment variables.

