# Apply Generation Jobs Migration

## ⚠️ Important: Manual SQL Execution Required

This migration creates the `generation_jobs` table for tracking AI generation tasks with status management and cost tracking.

## 📋 Steps to Apply

### 1. Open Supabase Dashboard
Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

### 2. Copy the Migration SQL
Open the migration file:
```
supabase/migrations/20260104230101_create_generation_jobs_table.sql
```

### 3. Run the Migration
- Copy the entire contents of the migration file
- Paste into the Supabase SQL Editor
- Click "Run" to execute

### 4. Verify Installation

Run these verification queries in the SQL editor:

```sql
-- Check table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'generation_jobs';

-- Check columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'generation_jobs'
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'generation_jobs';

-- Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'generation_jobs';

-- Test status transition function
SELECT proname 
FROM pg_proc 
WHERE proname = 'transition_job_status';
```

### 5. Expected Output

✅ Table `generation_jobs` created with 10 columns  
✅ 6 indexes created  
✅ RLS enabled (rowsecurity = true)  
✅ 4 RLS policies created (SELECT, INSERT, UPDATE, DELETE)  
✅ 3 SQL functions created (get_job_statistics, get_recent_jobs, transition_job_status)  
✅ 1 view created (generation_job_summary)  
✅ Trigger for `updated_at` created

## 🧪 Test the Integration

### Option 1: Web Interface
Visit: http://localhost:3001/jobs-test

Test these operations:
1. ✅ Select a project
2. ✅ Create a generation job (queued status)
3. ✅ Transition to "running"
4. ✅ Complete as "succeeded" or "failed"
5. ✅ View statistics (counts and costs)
6. ✅ Delete old jobs

### Option 2: SQL Tests

```sql
-- Insert a test job (replace UUIDs with your actual values)
INSERT INTO generation_jobs (user_id, project_id, mode, cost_cents)
VALUES (
  auth.uid(),
  'your-project-uuid',
  'lifestyle',
  100
);

-- Query your jobs
SELECT id, status, mode, cost_cents, created_at
FROM generation_jobs
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Get statistics
SELECT * FROM get_job_statistics();

-- Transition status (replace job-uuid)
SELECT transition_job_status(
  'job-uuid',
  'running',
  NULL
);

-- Check the updated status
SELECT id, status, updated_at
FROM generation_jobs
WHERE id = 'job-uuid';

-- Clean up test data
DELETE FROM generation_jobs
WHERE user_id = auth.uid();
```

## 🔍 What Was Created

### Main Table: `generation_jobs`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to auth.users (CASCADE) |
| project_id | UUID | FK to projects (CASCADE) |
| status | TEXT | queued/running/succeeded/failed |
| mode | TEXT | Generation mode |
| input_asset_id | UUID | FK to assets (SET NULL) |
| error | TEXT | Error message for failures |
| cost_cents | INTEGER | Cost in cents |
| created_at | TIMESTAMPTZ | Creation time |
| updated_at | TIMESTAMPTZ | Last update time |

### SQL Functions

1. **get_job_statistics(p_user_id)** - Aggregated job counts and costs by status
2. **get_recent_jobs(p_limit)** - Get latest N jobs for user
3. **transition_job_status(job_id, new_status, error)** - Safe status transitions with validation

### Views

1. **generation_job_summary** - Aggregated statistics by user, project, and status

### Status Workflow

```
queued → running → succeeded
                ↘ failed
```

Terminal states (succeeded/failed) cannot transition further.

## 🐛 Troubleshooting

### Error: "relation already exists"
The table is already created. Safe to ignore or drop and recreate:
```sql
DROP TABLE IF EXISTS generation_jobs CASCADE;
-- Then re-run migration
```

### Error: "function update_updated_at_column does not exist"
This function should exist from the projects migration. If not, it's defined in the migration file.

### Error: "permission denied"
Ensure you're running as the database owner/admin in Supabase SQL Editor.

### RLS blocking access
Check policies:
```sql
SELECT * FROM pg_policies WHERE tablename = 'generation_jobs';
```

All policies should filter by `auth.uid() = user_id`.

## 📚 Next Steps

After applying the migration:

1. ✅ Visit http://localhost:3001/jobs-test to test functionality
2. ✅ Create test jobs and verify status transitions
3. ✅ Check that RLS isolates user data
4. ✅ Test cost tracking and statistics
5. ✅ Integrate job creation into your generation workflows
6. ✅ Set up worker processes to handle queued jobs

## 📖 Documentation

See `docs/GENERATION_JOBS_SCHEMA.md` for:
- Complete API reference
- Usage examples
- TypeScript helpers
- Production considerations
- Advanced querying patterns

---

**Migration File:** `supabase/migrations/20260104230101_create_generation_jobs_table.sql`  
**Status:** Ready to apply ✅

