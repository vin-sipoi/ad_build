import { cookies } from 'next/headers';
import { adminAuth } from './firebase-admin';
import { redirect } from 'next/navigation';

export interface AdminUser {
  uid: string;
  email: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Verify admin session cookie and return admin user data
 */
export async function verifyAdminSession(): Promise<AdminUser | null> {
  try {
    if (!adminAuth) {
      console.error('Firebase Admin not configured');
      return null;
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin-session')?.value;
    const allCookies = cookieStore.getAll();
    
    console.log(`🔍 Admin auth check: Found ${allCookies.length} total cookies`);
    console.log(`🔍 Cookie names:`, allCookies.map(c => c.name));
    console.log(`🔍 Admin session cookie:`, sessionCookie ? `Found (${sessionCookie.length} chars)` : 'Not found');

    if (!sessionCookie) {
      console.log('No admin session cookie found');
      return null;
    }

    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Check if user has admin privileges
    if (!decodedClaims.admin && !decodedClaims.superAdmin) {
      console.log('User does not have admin privileges');
      return null;
    }

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || '',
      isAdmin: !!decodedClaims.admin,
      isSuperAdmin: !!decodedClaims.superAdmin,
    };
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return null;
  }
}

/**
 * Require admin authentication - redirects to sign-in if not authenticated
 */
export async function requireAdminAuth(): Promise<AdminUser> {
  const adminUser = await verifyAdminSession();
  
  if (!adminUser) {
    redirect('/sign-in?redirectTo=admin');
  }
  
  return adminUser;
}

/**
 * Check if current user is authenticated as admin (without redirect)
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const adminUser = await verifyAdminSession();
  return !!adminUser;
}

/**
 * Logout admin user by clearing session cookie
 */
export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-session');
}
