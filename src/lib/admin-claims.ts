import { adminAuth } from './firebase-admin';

export async function setAdminClaims(uid: string, isAdmin = true, isSuperAdmin = false) {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin not configured');
    }
    
    await adminAuth.setCustomUserClaims(uid, {
      admin: isAdmin,
      superAdmin: isSuperAdmin,
    });
    console.log(`Admin claims set for user ${uid}`);
    return true;
  } catch (error) {
    console.error('Error setting admin claims:', error);
    return false;
  }
}

export async function removeAdminClaims(uid: string) {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin not configured');
    }
    
    await adminAuth.setCustomUserClaims(uid, {
      admin: false,
      superAdmin: false,
    });
    console.log(`Admin claims removed for user ${uid}`);
    return true;
  } catch (error) {
    console.error('Error removing admin claims:', error);
    return false;
  }
}

export async function getUserClaims(uid: string) {
  try {
    if (!adminAuth) {
      throw new Error('Firebase Admin not configured');
    }
    
    const user = await adminAuth.getUser(uid);
    return user.customClaims || {};
  } catch (error) {
    console.error('Error getting user claims:', error);
    return {};
  }
}
