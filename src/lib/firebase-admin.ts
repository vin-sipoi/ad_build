import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

// Check for environment variables
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY;

let adminAuth: Auth | null = null;
let app: App | null = null;

if (projectId && clientEmail && privateKey) {
  const firebaseAdminConfig = {
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  };

  // Initialize Firebase Admin
  app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
  adminAuth = getAuth(app);
} else {
  console.warn('Firebase Admin credentials not configured. Admin features will be disabled.');
}

export { adminAuth };
export default app;
