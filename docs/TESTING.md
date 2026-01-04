# Authentication Testing Guide

## Development Server Status

✅ **Server is running on: http://localhost:3001**

## Quick Test Instructions

### Option 1: Automated Test Page (Recommended)

1. Visit: **http://localhost:3001/test-auth**
2. Click "Run Authentication Tests"
3. Watch the console output to see all auth flows working

This will automatically test:
- ✓ User sign up
- ✓ User sign in
- ✓ Session management
- ✓ Sign out

### Option 2: Manual Testing

#### Test Sign Up
1. Go to: **http://localhost:3001/auth/signup**
2. Enter an email and password (min 6 characters)
3. Click "Sign up"
4. You should be redirected to `/app` and see "This page can only be seen by logged-in users."

#### Test Login
1. Go to: **http://localhost:3001/auth/login**
2. Enter the same credentials
3. Click "Sign in"
4. You should be redirected to `/app`

#### Test Protected Route
1. Sign out from `/app`
2. Try to visit: **http://localhost:3001/app**
3. You should be automatically redirected to `/auth/login`

#### Test Root Redirect
- **When logged OUT**: Visit http://localhost:3001/ → redirects to `/auth/login`
- **When logged IN**: Visit http://localhost:3001/ → redirects to `/app`

#### Test Password Reset
1. Go to: **http://localhost:3001/auth/reset-password**
2. Enter your email
3. Click "Send reset link"
4. Check your email for the reset link (check Supabase email settings)

#### Test Sign Out
1. From `/app`, click the "Sign out" button
2. You should be redirected to `/auth/login`
3. Try accessing `/app` again - you should be blocked

## Supabase Configuration

Your Supabase instance is configured:
- **URL**: https://nlnekcseipemwdxuewjw.supabase.co
- **Status**: Connected ✓

### Email Confirmation Settings

By default, Supabase requires email confirmation. To disable it for testing:

1. Go to your Supabase Dashboard
2. Navigate to: **Authentication** → **Settings** → **Email Auth**
3. Toggle OFF: "Enable email confirmations"
4. This allows instant sign-up without email verification

## Testing Checklist

- [ ] Sign up creates a new user
- [ ] Sign in with valid credentials works
- [ ] Sign in with invalid credentials shows error
- [ ] Accessing `/app` when logged out redirects to login
- [ ] Accessing `/` when logged out redirects to login
- [ ] Accessing `/` when logged in redirects to `/app`
- [ ] Protected `/app` page shows correct message
- [ ] Sign out button works and redirects to login
- [ ] Password reset sends email (if configured)

## Troubleshooting

### "Invalid supabase credentials"
- Check `.env.local` has correct NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Restart dev server after changing env vars

### Email confirmation issues
- Disable email confirmations in Supabase dashboard (see above)
- OR configure SMTP settings in Supabase

### Redirects not working
- Check browser console for errors
- Verify middleware.ts is present in root directory
- Clear browser cookies and try again

## Browser Console Testing

You can also test auth directly in the browser console:

```javascript
// Get Supabase client
const { createClient } = await import('./lib/supabase/client')
const supabase = createClient()

// Test sign up
await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test123456'
})

// Test sign in
await supabase.auth.signInWithPassword({
  email: 'test@example.com', 
  password: 'test123456'
})

// Check session
await supabase.auth.getSession()

// Sign out
await supabase.auth.signOut()
```

## Next Steps

Once testing is complete:
1. Remove `/test-auth` page (if desired)
2. Customize the UI styling
3. Add more protected routes
4. Set up Supabase database tables
5. Deploy to production

