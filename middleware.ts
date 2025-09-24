import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`🔒 Middleware running for: ${pathname}`);

  // Check if this is an admin route
  if (pathname.startsWith('/admin')) {
    console.log(`🔍 Checking admin authentication for: ${pathname}`);
    
    const sessionCookie = request.cookies.get('admin-session')?.value;
    console.log(`🍪 Session cookie found: ${sessionCookie ? 'YES' : 'NO'}`);

    if (!sessionCookie) {
      console.log(`❌ No admin session cookie found, redirecting to sign-in`);
      return NextResponse.redirect(new URL('/sign-in?redirectTo=admin', request.url));
    }

    // Additional check: Verify session cookie is not empty or invalid
    if (sessionCookie.trim() === '' || sessionCookie === 'undefined' || sessionCookie === 'null') {
      console.log(`❌ Invalid session cookie, redirecting to sign-in`);
      return NextResponse.redirect(new URL('/sign-in?redirectTo=admin', request.url));
    }

    console.log(`✅ Valid session cookie found, proceeding to server-side verification`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
