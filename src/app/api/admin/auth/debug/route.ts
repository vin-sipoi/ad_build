import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

type VerifyResult = { success: true; decoded: Record<string, unknown> } | { success: false; error: string };
type SessionResult = { success: true; length: number } | { success: false; error: string };
type DebugResult = {
  adminAuthConfigured: boolean;
  env: Record<string, boolean>;
  verify?: VerifyResult | null;
  createSessionCookie?: SessionResult | null;
};

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

    const body = await request.json().catch(() => ({} as Record<string, unknown>));
    const idToken = (body && typeof body === 'object' && 'idToken' in body)
      ? (body as Record<string, unknown>)['idToken'] as string | undefined
      : undefined;

    const env = {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyContainsEscapedNewlines: (process.env.FIREBASE_PRIVATE_KEY || '').includes('\\n'),
      privateKeyContainsRealNewlines: (process.env.FIREBASE_PRIVATE_KEY || '').includes('\n'),
    };

    const result: DebugResult = {
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
        const decoded = await adminAuth.verifyIdToken(String(idToken));
        result.verify = { success: true, decoded } as VerifyResult;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        result.verify = { success: false, error: message };
      }

      // Try creating a short session cookie (catches errors in createSessionCookie)
      try {
        const expiresIn = 60 * 60 * 1000; // 1 hour
        const sessionCookie = await adminAuth.createSessionCookie(String(idToken), { expiresIn });
        result.createSessionCookie = { success: true, length: sessionCookie.length } as SessionResult;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        result.createSessionCookie = { success: false, error: message };
      }
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('Debug route error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
