# Commerce PIX

A Next.js starter project with Supabase Authentication and Tailwind CSS v4.

## Features

- ✅ Next.js 16 with App Router
- ✅ Supabase Authentication (email/password)
- ✅ Tailwind CSS v4
- ✅ TypeScript
- ✅ Protected routes with middleware
- ✅ Auth pages (login, signup, reset password)

## Getting Started

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

#### A. Create Project and Get Credentials

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Update the `.env.local` file in the root directory (it's already created with placeholder values):

```env
NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

**Important:** The project requires valid Supabase credentials to build. Make sure to update `.env.local` before running `npm run build`.

#### B. Set Up Storage Buckets

This project uses Supabase Storage for file uploads with two private buckets:

**Step 1:** Go to your Supabase Dashboard → Storage

**Step 2:** Create the following buckets (click "New bucket"):

1. **Bucket Name:** `commercepix-inputs`
   - **Public:** ❌ **No** (keep private)
   - **File size limit:** 50 MB
   - **Allowed MIME types:** Leave empty (or specify: `image/*`)
   - Click "Create bucket"

2. **Bucket Name:** `commercepix-outputs`
   - **Public:** ❌ **No** (keep private)
   - **File size limit:** 50 MB
   - **Allowed MIME types:** Leave empty (or specify: `image/*`)
   - Click "Create bucket"

**Step 3:** Configure Bucket Policies (Optional - for fine-grained control)

For each bucket, you can set up RLS policies similar to database tables. By default, authenticated users can access their own files if the path includes their user ID.

Example policy for `commercepix-inputs`:

```sql
-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'commercepix-inputs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users can read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'commercepix-inputs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'commercepix-inputs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

Repeat similar policies for `commercepix-outputs`.

**Step 4:** Verify Setup

Run this in the Supabase SQL Editor to verify buckets exist:

```sql
SELECT id, name, public 
FROM storage.buckets 
WHERE name IN ('commercepix-inputs', 'commercepix-outputs');
```

Expected output:
```
id                                   | name                  | public
-------------------------------------+-----------------------+--------
<uuid>                               | commercepix-inputs    | false
<uuid>                               | commercepix-outputs   | false
```

#### C. Apply Database Migrations

Apply the SQL migrations in `supabase/migrations/` to set up tables:

1. Go to Supabase Dashboard → SQL Editor
2. Apply each migration in order:
   - `20260104225132_create_projects_table.sql`
   - `20260104225553_create_assets_table.sql`
   - `20260104230101_create_generation_jobs_table.sql`

See `APPLY_MIGRATION.md` and `APPLY_GENERATION_JOBS_MIGRATION.md` for detailed instructions.

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
├── app/
│   ├── app/                 # Protected app area
│   │   └── page.tsx        # Main protected page
│   ├── auth/
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   └── reset-password/ # Password reset page
│   ├── layout.tsx
│   └── page.tsx            # Root page (redirects based on auth)
├── components/
│   └── SignOutButton.tsx   # Reusable sign-out component
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Auth middleware logic
│   ├── storage/
│   │   └── server.ts       # Storage helpers (upload, signed URLs, delete)
│   └── db/
│       ├── projects.ts     # Projects database helpers
│       ├── assets.ts       # Assets database helpers
│       └── generation-jobs.ts # Jobs database helpers
└── middleware.ts           # Next.js middleware

```

## Authentication Flow

### Public Routes
- `/auth/login` - Email/password login
- `/auth/signup` - Create new account
- `/auth/reset-password` - Request password reset link

### Protected Routes
- `/app` - Main protected area (only accessible when logged in)

### Redirects
- Visiting `/` when **not logged in** → redirects to `/auth/login`
- Visiting `/` when **logged in** → redirects to `/app`
- Visiting `/app/*` when **not logged in** → redirects to `/auth/login`

## Deploy on Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Add your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Storage

### Buckets

- `commercepix-inputs` - Private bucket for input images
- `commercepix-outputs` - Private bucket for generated outputs

### Helper Functions

```typescript
import { uploadFile, getSignedUrl, deleteFile, BUCKETS } from '@/lib/storage/server'

// Upload a file
const result = await uploadFile(
  BUCKETS.INPUTS,
  `${userId}/${projectId}/image.jpg`,
  file,
  { contentType: 'image/jpeg' }
)

// Get signed URL (1 hour expiry)
const { data } = await getSignedUrl(
  BUCKETS.INPUTS,
  `${userId}/${projectId}/image.jpg`,
  3600
)
console.log(data.signedUrl)

// Delete file
await deleteFile(BUCKETS.INPUTS, `${userId}/${projectId}/image.jpg`)
```

See `lib/storage/server.ts` for complete API documentation.

## Database

### Tables

- **projects** - User projects
- **assets** - Input and output assets
- **generation_jobs** - AI generation job tracking

All tables have Row Level Security (RLS) enabled. Users can only access their own data.

### Helper Functions

```typescript
import { getProjects, createProject } from '@/lib/db/projects'
import { getAssets, createAsset } from '@/lib/db/assets'
import { getGenerationJobs, createGenerationJob } from '@/lib/db/generation-jobs'
```

## Test Pages

- `/projects-test` - Test project CRUD operations
- `/assets-test` - Test asset management
- `/jobs-test` - Test generation job tracking
- `/storage-test` - Test file upload and signed URLs

## Documentation

- 📖 [Testing Guide](docs/TESTING.md) - How to test authentication
- 📋 [Project Summary](docs/PROJECT_SUMMARY.md) - Complete project overview
- 🔧 [Helper Functions](docs/HELPERS.md) - Using `getUser()` and `requireUser()`
- 🗄️ [Database Schema](docs/DATABASE_SCHEMA.md) - Projects table documentation
- 🖼️ [Assets Schema](docs/ASSETS_SCHEMA.md) - Assets table documentation
- ⚙️ [Generation Jobs](docs/GENERATION_JOBS_SCHEMA.md) - Jobs tracking
- 🔒 [RLS Policies](docs/RLS_POLICIES_VERIFICATION.md) - Row level security

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
