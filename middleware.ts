import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`🔒 Middleware running for: ${pathname}`);

  // Check if this is an admin route (but not the login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/unauthorized') {
    console.log(`🔍 Checking admin authentication for: ${pathname}`);
    
    const sessionCookie = request.cookies.get('admin-session')?.value;
    console.log(`🍪 Session cookie found: ${sessionCookie ? 'YES' : 'NO'}`);

    if (!sessionCookie) {
      console.log(`❌ No session cookie, redirecting to login`);
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // For now, let all requests with session cookies through
    // TODO: Add Firebase Admin SDK verification once import issue is resolved
    console.log(`✅ Session cookie present, allowing access to: ${pathname}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
