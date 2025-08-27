
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/signup', '/demo-login', '/test-auth-simple', '/api'];

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  
  // Allow all API routes to pass through
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // For all other routes, allow access (temporarily disable strict auth)
  // This prevents redirect loops while we fix the authentication system
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude Next internals and static assets
    '/((?!_next|favicon.ico|.*\\.).*)',
  ],
};
