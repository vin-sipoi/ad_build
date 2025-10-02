import mongoose from 'mongoose';
import { User } from '@/models/User';

// Force Atlas connection - no fallback to local MongoDB
const MONGODB_URI: string = process.env.MONGODB_URI!;

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables!');
  console.error('📝 Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO')));
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Log what we're connecting to (hide password)
console.log('🔗 MongoDB URI configured:', MONGODB_URI.includes('localhost') ? '❌ LOCAL (should be Atlas!)' : '✅ ATLAS');
console.log('📍 Connection string:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));

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
    console.log('🔄 Attempting MongoDB connection to:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
    
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds
      socketTimeoutMS: 30000, // Increased to 30 seconds
      connectTimeoutMS: 30000, // Increased to 30 seconds
      maxPoolSize: 10,
      retryWrites: true
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
      console.log('✅ Successfully connected to MongoDB Atlas');
      
      // Seed admin user if it doesn't exist
      await seedAdminUser();
      
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:');
      console.error('   Error type:', error.constructor.name);
      console.error('   Error message:', error.message);
      console.error('   Error code:', error.code);
      console.error('   Full error:', error);
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

/**
 * Connect to MongoDB using the cached connection.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
