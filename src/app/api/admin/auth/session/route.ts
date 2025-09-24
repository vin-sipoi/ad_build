import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { message: 'ID token is required' },
        { status: 400 }
      );
    }

    if (!adminAuth) {
      return NextResponse.json(
        { message: 'Firebase Admin not configured' },
        { status: 500 }
      );
    }

    // Verify the ID token and check for admin claims
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Check if user has admin claims
    if (!decodedToken.admin && !decodedToken.superAdmin) {
      return NextResponse.json(
        { message: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Create session cookie (expires in 5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    
    // Set the session cookie both ways
    console.log(`🍪 Setting admin session cookie, length: ${sessionCookie.length}`);
    
    // Use more permissive cookie settings for development
    const cookieOptions = {
      maxAge: expiresIn / 1000, // maxAge is in seconds
      httpOnly: false, // Allow JavaScript access for debugging
      secure: false, // Force false for localhost
      sameSite: 'lax' as const,
      path: '/',
    };
    
    cookieStore.set('admin-session', sessionCookie, cookieOptions);
    
    console.log(`🍪 Cookie set successfully, httpOnly: false, secure: false`);

    // Create response
    const response = NextResponse.json({
      message: 'Session created successfully',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email,
        admin: decodedToken.admin,
        superAdmin: decodedToken.superAdmin,
      },
    });
    
    // ALSO set cookie via response headers as primary method
    response.cookies.set('admin-session', sessionCookie, {
      maxAge: cookieOptions.maxAge,
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      path: '/',
    });
    
    return response;
  } catch (error: unknown) {
    console.error('Session creation error:', error);
    const firebaseError = error as { code?: string };
    
    if (firebaseError.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { message: 'Token expired. Please sign in again.' },
        { status: 401 }
      );
    } else if (firebaseError.code === 'auth/id-token-revoked') {
      return NextResponse.json(
        { message: 'Token revoked. Please sign in again.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to create session' },
      { status: 500 }
    );
  }
}
