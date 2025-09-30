// scripts/createFirebaseAdmin.js
// Creates or updates a Firebase Auth user with email/password and sets admin custom claim.
// Usage:
// 1. Ensure your .env.local contains FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY (with \n line breaks) and that it is correct.
// 2. Install firebase-admin: npm install firebase-admin
// 3. Run: node scripts/createFirebaseAdmin.js

// Prefer loading .env.local when present (this repo uses .env.local)
require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Missing Firebase env vars. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in your .env.local');
  console.error('Loaded env keys:', {
    FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
    FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
    FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
  });
  process.exit(1);
}

// Normalize private key: remove surrounding quotes if present and convert literal \n to real newlines
if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
  privateKey = privateKey.slice(1, -1);
}
privateKey = privateKey.replace(/\\n/g, '\n');

try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
} catch (err) {
  // initializeApp can throw if already initialized; ignore
}

const auth = admin.auth();

async function createOrUpdateAdmin() {
  const email = 'build@adamur.io';
  const password = 'ChangeMe123!'; // choose a secure password and change after login

  try {
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log('Firebase user already exists:', user.uid);
      // Optionally update password if you want to set a known password
      await auth.updateUser(user.uid, { password });
      console.log('Updated password for existing user.');
    } catch (notFoundErr) {
      if (notFoundErr.code === 'auth/user-not-found') {
        user = await auth.createUser({ email, password, emailVerified: true });
        console.log('Created Firebase user:', user.uid);
      } else {
        throw notFoundErr;
      }
    }

    // Set custom claim 'admin'
    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log('Set custom claim { admin: true } for', user.uid);

    console.log('Done. You can now sign in with', email, 'and password', password);
    console.log('For security, change the password in Firebase Console after first login.');
  } catch (err) {
    console.error('Error creating/updating Firebase user:', err);
    process.exit(1);
  }
}

createOrUpdateAdmin();
