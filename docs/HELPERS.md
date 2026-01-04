# Supabase Helper Functions

This project includes two powerful helper functions for authentication in server components and server actions.

## Overview

Both helpers are located in `lib/supabase/server.ts` and use React's `cache` API to prevent duplicate fetches within the same request.

## Functions

### `getUser()`

Returns the current authenticated user or `null` if not logged in.

**Returns:** `User | null`

**Does NOT redirect** - ideal for conditional rendering.

#### Usage Example

```typescript
import { getUser } from '@/lib/supabase/server'

export default async function HomePage() {
  const user = await getUser()
  
  if (user) {
    return <div>Welcome, {user.email}!</div>
  }
  
  return <div>Please log in</div>
}
```

#### When to Use

- Landing pages that show different content for logged in/out users
- Optional auth features
- Navigation components that adapt based on auth status
- Any page where you want to handle auth checking manually

---

### `requireUser()`

Returns the authenticated user or **redirects to `/auth/login`** if not logged in.

**Returns:** `User` (always - redirects if no user)

**Automatically redirects** - perfect for protected pages.

#### Usage Example

```typescript
import { requireUser } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  // Automatically redirects to /auth/login if not logged in
  const user = await requireUser()
  
  // This code only runs for authenticated users
  return <div>Protected content for {user.email}</div>
}
```

#### When to Use

- Dashboard pages
- Profile pages
- Settings pages
- Any page that requires authentication
- Admin areas

---

## Comparison Table

| Feature | `getUser()` | `requireUser()` |
|---------|-------------|-----------------|
| **Returns** | `User \| null` | `User` (always) |
| **Redirects if not logged in** | No | Yes (to `/auth/login`) |
| **Request caching** | Yes (React cache) | Yes (uses getUser internally) |
| **Use in Server Components** | ✓ | ✓ |
| **Use in Server Actions** | ✓ | ✓ |
| **Use in Route Handlers** | ✓ | ✓ |

---

## Examples in This Project

### Home Page (`app/page.tsx`)
Uses `getUser()` to show different content based on auth status:
- **Logged out:** Shows "Sign In" and "Create Account" buttons
- **Logged in:** Shows welcome message with link to app

### Protected App Page (`app/app/page.tsx`)
Uses `requireUser()` to protect the entire page:
- Automatically redirects non-authenticated users
- Only authenticated users can see the content

### Demo Page (`app/demo-helpers/page.tsx`)
Interactive demonstration of both helpers with:
- Real-time auth status
- Code examples
- Comparison table
- Live testing links

---

## Implementation Details

### Caching

Both functions use React's `cache` API to ensure the user is fetched only once per request, even if called multiple times:

```typescript
export const getUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error fetching user:', error.message)
    return null
  }
  
  return user
})
```

### Error Handling

- Network errors: Returns `null` (logged to console)
- No session: Returns `null` (not an error)
- Invalid token: Returns `null` (Supabase handles validation)

### TypeScript Support

Both functions are fully typed with Supabase's User type:

```typescript
import type { User } from '@supabase/supabase-js'

// getUser returns User | null
const user: User | null = await getUser()

// requireUser returns User (never null)
const user: User = await requireUser()
```

---

## Server Actions Example

```typescript
'use server'

import { requireUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  // Ensures user is logged in
  const user = await requireUser()
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({
      name: formData.get('name'),
    })
    .eq('user_id', user.id)
  
  if (error) throw error
  
  return { success: true }
}
```

---

## Route Handler Example

```typescript
import { requireUser } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await requireUser()
  
  return NextResponse.json({
    userId: user.id,
    email: user.email,
  })
}
```

---

## Best Practices

1. **Use `requireUser()` for protected pages** - Cleaner code, automatic redirects
2. **Use `getUser()` for flexible pages** - Manual control over UX
3. **Both are cached** - Safe to call multiple times in same request
4. **Server-side only** - These helpers work in server components, server actions, and route handlers
5. **Client-side auth** - Use `createClient()` from `lib/supabase/client.ts` for client components

---

## Testing

Visit [`/demo-helpers`](http://localhost:3001/demo-helpers) to see an interactive demonstration of both functions.

Run the authentication tests at [`/test-auth`](http://localhost:3001/test-auth) to verify the entire auth flow.

