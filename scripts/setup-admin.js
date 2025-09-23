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

async function setupAdmin(emailArg) {
  try {
    const email = emailArg || process.argv[3]; // Use passed email or get from args
    const isSuper = process.argv[4] === 'super';

    if (!email) {
      console.log('Usage: node scripts/setup-admin.js <email> [super]');
      console.log('Example: node scripts/setup-admin.js admin@example.com');
      console.log('Example: node scripts/setup-admin.js admin@example.com super');
      process.exit(1);
    }

    // Get user by email
    const user = await auth.getUserByEmail(email);
    
    // Set admin custom claims
    await auth.setCustomUserClaims(user.uid, {
      admin: true,
      superAdmin: isSuper,
    });
    
    console.log(`✅ Admin claims set for user: ${email}`);
    console.log(`   User UID: ${user.uid}`);
    console.log(`   Admin: true`);
    console.log(`   Super Admin: ${isSuper}`);
    console.log(`\n🚀 User can now access the admin panel at /admin/login`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
    
    if (error.code === 'auth/user-not-found') {
      console.log('\n💡 Make sure the user is registered in Firebase Auth first.');
      console.log('   Users can register through your main application.');
    }
    
    process.exit(1);
  }
}

// Also export for programmatic use
async function removeAdmin(email) {
  try {
    const user = await auth.getUserByEmail(email);
    
    await auth.setCustomUserClaims(user.uid, {
      admin: false,
      superAdmin: false,
    });
    
    console.log(`✅ Admin claims removed for user: ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error removing admin claims:', error.message);
    return false;
  }
}

async function listAdmins() {
  try {
    console.log('🔍 Searching for admin users...\n');
    
    let admins = [];
    let nextPageToken;
    
    do {
      const listResult = await auth.listUsers(1000, nextPageToken);
      
      for (const user of listResult.users) {
        if (user.customClaims?.admin || user.customClaims?.superAdmin) {
          admins.push({
            uid: user.uid,
            email: user.email,
            admin: user.customClaims.admin,
            superAdmin: user.customClaims.superAdmin,
          });
        }
      }
      
      nextPageToken = listResult.pageToken;
    } while (nextPageToken);
    
    if (admins.length === 0) {
      console.log('No admin users found.');
    } else {
      console.log(`Found ${admins.length} admin user(s):\n`);
      admins.forEach(admin => {
        console.log(`📧 ${admin.email}`);
        console.log(`   UID: ${admin.uid}`);
        console.log(`   Admin: ${admin.admin}`);
        console.log(`   Super Admin: ${admin.superAdmin}`);
        console.log('');
      });
    }
    
    return admins;
  } catch (error) {
    console.error('❌ Error listing admins:', error.message);
    return [];
  }
}

// Handle command line usage
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'list') {
    listAdmins().then(() => process.exit(0));
  } else if (command === 'remove') {
    const email = process.argv[3];
    if (!email) {
      console.log('Usage: node scripts/setup-admin.js remove <email>');
      process.exit(1);
    }
    removeAdmin(email).then(() => process.exit(0));
  } else if (command === 'setup') {
    const email = process.argv[3];
    if (!email) {
      console.log('Usage: node scripts/setup-admin.js setup <email> [super]');
      process.exit(1);
    }
    setupAdmin(email).then(() => process.exit(0));
  } else {
    setupAdmin();
  }
}

module.exports = { setupAdmin, removeAdmin, listAdmins };
