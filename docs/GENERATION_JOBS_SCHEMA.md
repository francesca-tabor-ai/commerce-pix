# Generation Jobs Table Implementation

## ✅ Overview

The `generation_jobs` table provides a robust system for tracking AI generation tasks with status management, cost tracking, and comprehensive querying capabilities.

## 📊 Schema

### Table: `generation_jobs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| `user_id` | UUID | NOT NULL, FK → auth.users ON DELETE CASCADE | Job owner |
| `project_id` | UUID | NOT NULL, FK → projects ON DELETE CASCADE | Parent project |
| `status` | TEXT | NOT NULL, CHECK ('queued', 'running', 'succeeded', 'failed'), DEFAULT 'queued' | Job status |
| `mode` | TEXT | NOT NULL | Generation mode |
| `input_asset_id` | UUID | NULLABLE, FK → assets ON DELETE SET NULL | Input asset reference |
| `error` | TEXT | NULLABLE | Error message for failed jobs |
| `cost_cents` | INTEGER | NOT NULL, DEFAULT 0 | Cost in cents |
| `created_at` | TIMESTAMPTZ | DEFAULT now() NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() NOT NULL | Last update timestamp |

### Status Values

**Valid States:**
- `queued` - Job is waiting to be processed (initial state)
- `running` - Job is currently being processed
- `succeeded` - Job completed successfully (terminal)
- `failed` - Job failed with an error (terminal)

**Status Workflow:**
```
queued → running → succeeded
                ↘ failed
```

**Terminal States:** Once a job reaches `succeeded` or `failed`, it cannot transition to another state.

## 🔒 Security & Constraints

### Row Level Security (RLS)

All operations filtered by `auth.uid() = user_id`:
- ✅ Users can SELECT only their jobs
- ✅ Users can INSERT only for themselves
- ✅ Users can UPDATE only their jobs
- ✅ Users can DELETE only their jobs

### Foreign Key Constraints

```sql
user_id → auth.users(id) ON DELETE CASCADE
project_id → projects(id) ON DELETE CASCADE
input_asset_id → assets(id) ON DELETE SET NULL
```

**Cascade Behavior:**
- Delete user → deletes all their jobs
- Delete project → deletes all project jobs
- Delete asset → sets input_asset_id to NULL

### Check Constraint

```sql
status IN ('queued', 'running', 'succeeded', 'failed')
```

## ⚡ Performance

### Indexes

```sql
-- Standard B-tree indexes
idx_generation_jobs_user_id ON generation_jobs(user_id)
idx_generation_jobs_project_id ON generation_jobs(project_id)
idx_generation_jobs_status ON generation_jobs(status)
idx_generation_jobs_input_asset_id ON generation_jobs(input_asset_id)
idx_generation_jobs_created_at ON generation_jobs(created_at DESC)

-- Composite index for common queries
idx_generation_jobs_user_status ON generation_jobs(user_id, status)
```

**Query Optimization:**
- Fast user/project filtering
- Efficient status lookups
- Quick chronological sorting
- Combined user + status queries

## 🔧 Helper Functions

### SQL Functions

**get_job_statistics(p_user_id)**
```sql
SELECT * FROM get_job_statistics();
-- Returns: status, count, total_cost_cents, avg_cost_cents
```

**get_recent_jobs(p_limit)**
```sql
SELECT * FROM get_recent_jobs(10);
-- Returns: Latest N jobs for the user
```

**transition_job_status(p_job_id, p_new_status, p_error)**
```sql
SELECT transition_job_status(
  'job-uuid',
  'running',
  NULL
);
-- Safely transitions job status with validation
```

### Views

**generation_job_summary**
```sql
SELECT * FROM generation_job_summary;
-- Aggregated statistics by user, project, and status
```

## 📝 TypeScript API

### Types

```typescript
type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed'

type GenerationJob = {
  id: string
  user_id: string
  project_id: string
  status: JobStatus
  mode: string
  input_asset_id: string | null
  error: string | null
  cost_cents: number
  created_at: string
  updated_at: string
}
```

### Server Functions (lib/db/generation-jobs.ts)

```typescript
getGenerationJobs()                // Get all user's jobs
getProjectJobs(projectId)          // Get jobs for project
getJobsByStatus(status)            // Filter by status
getGenerationJob(id)               // Get single job
createGenerationJob(data)          // Create new job
updateGenerationJob(id, updates)   // Update job
transitionJobStatus(id, status)    // Safe status transition
deleteGenerationJob(id)            // Delete job
getJobStatistics()                 // Get aggregated stats
getRecentJobs(limit)               // Get latest jobs
getTotalCosts()                    // Calculate total costs
```

### Client Functions (lib/db/generation-jobs-client.ts)

Same API with `Client` suffix for use in client components.

## 💡 Usage Examples

### Creating a Job

```typescript
import { createGenerationJob } from '@/lib/db/generation-jobs'

const job = await createGenerationJob({
  project_id: 'project-uuid',
  mode: 'lifestyle',
  input_asset_id: 'asset-uuid',
  cost_cents: 250  // $2.50
})
// Status automatically set to 'queued'
```

### Transitioning Job Status

```typescript
import { transitionJobStatus } from '@/lib/db/generation-jobs'

// Start processing
await transitionJobStatus(jobId, 'running')

// Complete successfully
await transitionJobStatus(jobId, 'succeeded')

// Or fail with error
await transitionJobStatus(jobId, 'failed', 'API timeout')
```

### Querying Jobs

```typescript
// Get all queued jobs
const queuedJobs = await getJobsByStatus('queued')

// Get recent jobs
const recent = await getRecentJobs(5)

// Get statistics
const stats = await getJobStatistics()
// Returns: [{status: 'succeeded', count: 10, total_cost_cents: 1000, ...}]
```

### Cost Tracking

```typescript
// Calculate total spend
const totalCents = await getTotalCosts()
const totalDollars = totalCents / 100

// Per-status costs from statistics
const stats = await getJobStatistics()
stats.forEach(stat => {
  console.log(`${stat.status}: $${stat.total_cost_cents / 100}`)
})
```

## 🎯 Use Cases

### 1. Job Queue Management

```typescript
// Worker process picks up queued jobs
const queuedJobs = await getJobsByStatus('queued')

for (const job of queuedJobs) {
  await transitionJobStatus(job.id, 'running')
  
  try {
    // Process job...
    await transitionJobStatus(job.id, 'succeeded')
  } catch (error) {
    await transitionJobStatus(job.id, 'failed', error.message)
  }
}
```

### 2. Cost Management

```typescript
// Check if user has budget
const stats = await getJobStatistics()
const succeededJobs = stats.find(s => s.status === 'succeeded')
const totalSpent = succeededJobs?.total_cost_cents || 0

if (totalSpent + newJobCost > userBudget) {
  throw new Error('Insufficient budget')
}
```

### 3. Project Dashboard

```typescript
// Show project job summary
const jobs = await getProjectJobs(projectId)
const byStatus = jobs.reduce((acc, job) => {
  acc[job.status] = (acc[job.status] || 0) + 1
  return acc
}, {})

console.log(`Queued: ${byStatus.queued || 0}`)
console.log(`Running: ${byStatus.running || 0}`)
console.log(`Succeeded: ${byStatus.succeeded || 0}`)
console.log(`Failed: ${byStatus.failed || 0}`)
```

## 🧪 Testing

Visit: http://localhost:3001/jobs-test

**Test Features:**
1. Select a project
2. Create generation jobs with different modes
3. Transition job status (queued → running → succeeded/failed)
4. View job statistics and costs
5. Delete completed jobs
6. Verify RLS isolation

## 📋 Migration Application

### Step 1: Apply Migration

```sql
-- Copy from: supabase/migrations/20260104230101_create_generation_jobs_table.sql
-- Run in Supabase SQL Editor
```

### Step 2: Verify

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'generation_jobs'
ORDER BY ordinal_position;

-- Check status constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%status%';

-- Test status transition function
SELECT transition_job_status(
  'test-uuid',
  'running',
  NULL
);
```

## 🔄 Relationship Diagram

```
┌──────────────┐
│  auth.users  │
└──────┬───────┘
       │ CASCADE
       │
┌──────▼───────┐
│   projects   │
└──────┬───────┘
       │ CASCADE
       │
┌──────▼────────┐        ┌──────────┐
│    assets     │◄───────│  assets  │
└───────────────┘ SET    └──────────┘
       ▲          NULL
       │
┌──────┴──────────────────┐
│   generation_jobs       │
├─────────────────────────┤
│ id (PK)                 │
│ user_id (FK)            │
│ project_id (FK)         │
│ input_asset_id (FK)     │
│ status (CHECK)          │
│ mode                    │
│ error                   │
│ cost_cents              │
│ ...                     │
└─────────────────────────┘
```

## ✨ Advanced Features

### Status Transition Validation

The `transition_job_status()` function prevents invalid transitions:

```sql
-- Valid transitions
queued → running    ✓
running → succeeded ✓
running → failed    ✓

-- Invalid transitions (returns FALSE)
succeeded → *       ✗  (terminal state)
failed → *          ✗  (terminal state)
```

### Aggregated Statistics

```sql
SELECT * FROM generation_job_summary
WHERE user_id = auth.uid()
ORDER BY total_cost_cents DESC;

-- Shows per-project, per-status statistics
```

### Cost Analysis

```typescript
const stats = await getJobStatistics()

// Calculate success rate
const total = stats.reduce((sum, s) => sum + s.count, 0)
const succeeded = stats.find(s => s.status === 'succeeded')?.count || 0
const successRate = (succeeded / total) * 100

// Calculate average cost per job
const totalCost = stats.reduce((sum, s) => sum + s.total_cost_cents, 0)
const avgCost = totalCost / total
```

## 🚀 Production Considerations

1. **Job Processing**: Implement worker processes to handle queued jobs
2. **Retry Logic**: Consider adding retry_count column for failed jobs
3. **Timeouts**: Add timeout handling for stuck "running" jobs
4. **Monitoring**: Track job completion times and failure rates
5. **Cost Limits**: Implement budget controls per user/project
6. **Cleanup**: Archive or delete old completed jobs
7. **Notifications**: Alert users when jobs complete or fail

### Recommended Additions

```sql
-- Add retry count
ALTER TABLE generation_jobs ADD COLUMN retry_count INTEGER DEFAULT 0;

-- Add completion time
ALTER TABLE generation_jobs ADD COLUMN completed_at TIMESTAMPTZ;

-- Add timeout detection view
CREATE VIEW stuck_jobs AS
SELECT * FROM generation_jobs
WHERE status = 'running'
AND updated_at < now() - INTERVAL '30 minutes';
```

---

**Status:** Schema ready ✅ | Helper functions complete ✅ | Test page working ✅

