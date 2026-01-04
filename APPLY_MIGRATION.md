# Apply Supabase Migration

## Quick Start Guide

### Step 1: Copy the Migration SQL

The migration file is located at:
```
supabase/migrations/20260104225132_create_projects_table.sql
```

### Step 2: Apply to Supabase

1. **Go to your Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/nlnekcseipemwdxuewjw

2. **Navigate to SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the Migration:**
   - Open: `supabase/migrations/20260104225132_create_projects_table.sql`
   - Copy all contents
   - Paste into the SQL Editor

4. **Run the Migration:**
   - Click "Run" or press `Cmd/Ctrl + Enter`
   - Wait for success message

### Step 3: Verify the Migration

Run this query to verify:

```sql
-- Check if table was created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'projects';
```

### Step 4: Test in the App

1. Make sure you're logged in
2. Visit: http://localhost:3001/projects-test
3. Try creating a project
4. Try editing and deleting projects
5. Verify everything works!

## Troubleshooting

**Error: "relation 'projects' already exists"**
- The table already exists. You can drop it first:
  ```sql
  DROP TABLE IF EXISTS projects CASCADE;
  ```
  Then run the migration again.

**Error: "permission denied"**
- Make sure you're running the query as a superuser
- Check that your project URL and anon key are correct

**Projects not showing up:**
- Check that you're logged in
- Verify RLS policies are working
- Check browser console for errors

## What Gets Created

✅ `projects` table with proper schema
✅ Indexes on `user_id` and `created_at`
✅ Row Level Security enabled
✅ 4 RLS policies (SELECT, INSERT, UPDATE, DELETE)
✅ Auto-update trigger for `updated_at`
✅ Table and column comments

After applying, you'll be able to use the helper functions in `lib/db/projects.ts`!

