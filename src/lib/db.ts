import mongoose from 'mongoose';
import { User } from '@/models/User';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/adamur-academy';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached: MongooseCache = (global as { mongoose?: MongooseCache }).mongoose || { conn: null, promise: null };

if (!cached.conn) {
  cached = (global as { mongoose?: MongooseCache }).mongoose = { conn: null, promise: null };
}

// Seed admin user function
async function seedAdminUser() {
  try {
    const adminUserId = '507f1f77bcf86cd799439011';
    const existingUser = await User.findById(adminUserId);
    
    if (!existingUser) {
      await User.create({
        _id: adminUserId,
        email: 'admin@adamur.com',
        name: 'Admin User',
        roles: ['admin', 'mentor', 'learner'],
        profile: {
          avatarUrl: '',
          bio: 'System Administrator'
        }
      });
      console.log('Admin user seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5 second timeout instead of 30
      socketTimeoutMS: 10000, // 10 second socket timeout
      connectTimeoutMS: 10000, // 10 second connection timeout
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
      console.log('Connected to MongoDB');
      
      // Seed admin user if it doesn't exist
      await seedAdminUser();
      
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection failed:', error.message);
      cached.promise = null; // Reset promise so it can retry
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
