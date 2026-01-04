# Supabase Migrations

This directory contains SQL migrations for the Supabase database schema.

## Migrations

### `20260104225132_create_projects_table.sql`

Creates the `projects` table with the following schema:

**Table: `projects`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key to `auth.users`, not null |
| `name` | TEXT | Project name, not null |
| `created_at` | TIMESTAMPTZ | Creation timestamp, default now() |
| `updated_at` | TIMESTAMPTZ | Last update timestamp, auto-updated |

**Features:**
- Row Level Security (RLS) enabled
- Users can only access their own projects
- Automatic `updated_at` timestamp via trigger
- Indexes on `user_id` and `created_at` for performance
- Cascade delete when user is deleted

**RLS Policies:**
- `Users can view own projects` - SELECT policy
- `Users can insert own projects` - INSERT policy
- `Users can update own projects` - UPDATE policy
- `Users can delete own projects` - DELETE policy

## How to Apply Migrations

### Option 1: Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Link to your project:
```bash
supabase link --project-ref your-project-ref
```

3. Apply migrations:
```bash
supabase db push
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of the migration file
4. Paste and run the SQL

### Option 3: Manual Application

Run the SQL directly in your Supabase SQL Editor:

```sql
-- Copy contents from:
-- supabase/migrations/20260104225132_create_projects_table.sql
```

## Testing the Migration

After applying the migration, test it using:

1. Visit `/projects-test` in your app
2. Try creating, updating, and deleting projects
3. Verify RLS is working (users only see their own projects)

## Helper Functions

TypeScript helper functions are available in `lib/db/projects.ts`:

**Server-side:**
- `getProjects()` - Get all user's projects
- `getProject(id)` - Get a single project
- `createProject(data)` - Create a new project
- `updateProject(id, data)` - Update a project
- `deleteProject(id)` - Delete a project

**Client-side:**
- `getProjectsClient()` - Get all projects (client)
- `createProjectClient(data)` - Create project (client)
- `updateProjectClient(id, data)` - Update project (client)
- `deleteProjectClient(id)` - Delete project (client)

## Verification

To verify the migration was successful:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'projects'
);

-- Check RLS is enabled
SELECT relrowsecurity 
FROM pg_class 
WHERE relname = 'projects';

-- List all policies
SELECT * 
FROM pg_policies 
WHERE tablename = 'projects';
```

## Rollback

If you need to rollback this migration:

```sql
-- Drop the table (this will also drop all policies and triggers)
DROP TABLE IF EXISTS projects CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

## Notes

- All timestamps use `TIMESTAMPTZ` (timestamp with timezone)
- The `updated_at` column is automatically updated via trigger
- RLS ensures data isolation between users
- Indexes improve query performance for common operations

