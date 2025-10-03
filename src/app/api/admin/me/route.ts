import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    const adminUser = await verifyAdminSession();
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: adminUser.uid,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin,
        isSuperAdmin: adminUser.isSuperAdmin,
      }
    });
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
