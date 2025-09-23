import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';
import { setAdminClaims, removeAdminClaims } from '@/lib/admin-claims';

export async function POST(request: NextRequest) {
  try {
    // Check if the requester is authenticated as an admin
    const sessionCookie = request.cookies.get('admin-session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!adminAuth) {
      return NextResponse.json(
        { message: 'Firebase Admin not configured' },
        { status: 500 }
      );
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Only super admins can manage admin claims
    if (!decodedClaims.superAdmin) {
      return NextResponse.json(
        { message: 'Super admin privileges required' },
        { status: 403 }
      );
    }

    const { uid, action, isAdmin, isSuperAdmin } = await request.json();

    if (!uid || !action) {
      return NextResponse.json(
        { message: 'UID and action are required' },
        { status: 400 }
      );
    }

    let result = false;

    if (action === 'set') {
      result = await setAdminClaims(uid, isAdmin, isSuperAdmin);
    } else if (action === 'remove') {
      result = await removeAdminClaims(uid);
    } else {
      return NextResponse.json(
        { message: 'Invalid action. Use "set" or "remove"' },
        { status: 400 }
      );
    }

    if (result) {
      return NextResponse.json({
        message: `Admin claims ${action}${action === 'set' ? '' : 'd'} successfully`,
        uid,
      });
    } else {
      return NextResponse.json(
        { message: 'Failed to update admin claims' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Admin claims management error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
