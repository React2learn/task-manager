import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  // Define protected routes
  const isProtectedPage = 
    request.nextUrl.pathname.startsWith('/dashboard') || 
    request.nextUrl.pathname.startsWith('/tasks')
  
  const isAuthPage = request.nextUrl.pathname === '/login'
  
  // Redirect to login if accessing protected page without token
  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Redirect to dashboard if accessing login with token
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tasks/:path*',  // This covers ALL /tasks/* routes including /tasks/completed
    '/login',
  ], 
}