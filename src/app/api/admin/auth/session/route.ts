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
    
    // Set the session cookie
    cookieStore.set('admin-session', sessionCookie, {
      maxAge: expiresIn / 1000, // maxAge is in seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({
      message: 'Session created successfully',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email,
        admin: decodedToken.admin,
        superAdmin: decodedToken.superAdmin,
      },
    });
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
