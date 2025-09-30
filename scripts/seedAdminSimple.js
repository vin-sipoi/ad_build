// scripts/seedAdminSimple.js
// Plain CommonJS script that uses mongoose directly and defines a minimal User schema
// Run with: node scripts/seedAdminSimple.js

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adamur_dev';

async function run() {
  console.log('Connecting to MongoDB:', MONGODB_URI.replace(/(https?:\/\/)?(.*@)?(.*)/, '***REDACTED***'));
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    roles: { type: [String], default: ['learner'] },
    profile: { avatarUrl: String, bio: String },
  }, { timestamps: true });

  // Use existing collection if present
  const User = mongoose.models.User || mongoose.model('User', userSchema);

  const adminEmail = 'build@adamur.io';

  const existing = await User.findOne({ email: adminEmail }).lean();
  if (existing) {
    console.log('Admin already exists in users collection:');
    console.log(existing);
    await mongoose.disconnect();
    return;
  }

  const admin = new User({
    email: adminEmail,
    name: 'Admin',
    roles: ['admin'],
    profile: {},
  });

  await admin.save();
  console.log('Created admin user:');
  console.log({ _id: admin._id, email: admin.email, roles: admin.roles });

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Seeding failed:', err);
  process.exitCode = 1;
});
