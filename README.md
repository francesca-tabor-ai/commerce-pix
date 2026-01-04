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

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Update the `.env.local` file in the root directory (it's already created with placeholder values):

```env
NEXT_PUBLIC_SUPABASE_URL=your-actual-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
```

**Important:** The project requires valid Supabase credentials to build. Make sure to update `.env.local` before running `npm run build`.

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
│   └── supabase/
│       ├── client.ts       # Browser client
│       ├── server.ts       # Server client
│       └── middleware.ts   # Auth middleware logic
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

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
