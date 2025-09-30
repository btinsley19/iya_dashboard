import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: Request) {
  const { pathname } = new URL(request.url)
  
  // Allow auth pages and API routes
  if (pathname.startsWith('/auth') || pathname.startsWith('/api')) {
    return await updateSession(request)
  }
  
  // For all other pages, just update the session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
