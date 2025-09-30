import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get('x-debug-secret');

    // Protect the endpoint with a secret env var
    const required = process.env.DEBUG_SEED_SECRET;
    if (!required) {
      return NextResponse.json({ error: 'Server: DEBUG_SEED_SECRET not set' }, { status: 500 });
    }
    if (secret !== required) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const idToken = body?.idToken;

    const env = {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyContainsEscapedNewlines: (process.env.FIREBASE_PRIVATE_KEY || '').includes('\\n'),
      privateKeyContainsRealNewlines: (process.env.FIREBASE_PRIVATE_KEY || '').includes('\n'),
    };

    const result: any = {
      adminAuthConfigured: !!adminAuth,
      env,
      verify: null,
      createSessionCookie: null,
    };

    if (!adminAuth) {
      return NextResponse.json({ message: 'Firebase Admin not configured', details: result }, { status: 500 });
    }

    if (idToken) {
      try {
        const decoded = await adminAuth.verifyIdToken(idToken);
        result.verify = { success: true, decoded };
      } catch (err: any) {
        result.verify = { success: false, error: err?.code || err?.message || String(err) };
      }

      // Try creating a short session cookie (catches errors in createSessionCookie)
      try {
        const expiresIn = 60 * 60 * 1000; // 1 hour
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
        result.createSessionCookie = { success: true, length: sessionCookie.length };
      } catch (err: any) {
        result.createSessionCookie = { success: false, error: err?.code || err?.message || String(err) };
      }
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Debug route error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
