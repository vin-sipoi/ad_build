const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_ADMIN_PRIVATE_KEY)?.replace(/\\n/g, '\n'),
  }),
});

const auth = getAuth(app);

async function checkUser() {
  try {
    console.log('Checking user build@adamur.io...');
    
    // Try to get user by email
    const user = await auth.getUserByEmail('build@adamur.io');
    console.log('✅ User found:', {
      uid: user.uid,
      email: user.email,
      claims: user.customClaims || {}
    });
    
    // Set admin claims
    await auth.setCustomUserClaims(user.uid, {
      admin: true,
      superAdmin: false,
    });
    
    console.log('✅ Admin claims set successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 The user build@adamur.io does not exist in Firebase Auth.');
      console.log('   Please register this user first by:');
      console.log('   1. Going to your app\'s sign-up page');
      console.log('   2. Creating an account with build@adamur.io');
      console.log('   3. Then running this script again');
    }
  }
  
  process.exit(0);
}

checkUser();
