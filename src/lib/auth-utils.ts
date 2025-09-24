import { User } from 'firebase/auth';

/**
 * Check if a user has admin claims by getting their ID token
 */
export async function checkAdminClaims(user: User): Promise<{ isAdmin: boolean; isSuperAdmin: boolean }> {
  try {
    // Force refresh to get latest claims
    const idTokenResult = await user.getIdTokenResult(true);
    
    return {
      isAdmin: !!idTokenResult.claims.admin,
      isSuperAdmin: !!idTokenResult.claims.superAdmin,
    };
  } catch (error) {
    console.error('Error checking admin claims:', error);
    return {
      isAdmin: false,
      isSuperAdmin: false,
    };
  }
}

/**
 * Get the appropriate redirect URL based on user's admin status
 */
export async function getRedirectUrlForUser(user: User): Promise<string> {
  const { isAdmin } = await checkAdminClaims(user);
  
  if (isAdmin) {
    return '/admin';
  }
  
  return '/dashboard';
}
