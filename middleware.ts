import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { generateRequestId } from '@/lib/request-context'

export async function middleware(request: NextRequest) {
  // Generate or get request ID for tracing
  const requestId = request.headers.get('x-request-id') || generateRequestId()
  
  // Create response with request ID header
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-request-id', requestId)
  
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  
  // Add request ID to response headers for client visibility
  response.headers.set('x-request-id', requestId)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isAppPage = request.nextUrl.pathname.startsWith('/app')

  // If user is authenticated and trying to access auth pages, redirect to app
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  // If user is not authenticated and trying to access app pages, redirect to auth
  if (!user && isAppPage) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('tab', 'signin')
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (they have their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
