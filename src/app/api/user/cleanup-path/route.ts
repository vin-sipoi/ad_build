import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { adminAuth } from '@/lib/firebase-admin';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get Firebase ID token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const idToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the Firebase ID token
    let firebaseUser;
    try {
      if (!adminAuth) {
        return NextResponse.json(
          { error: 'Firebase admin not initialized' },
          { status: 500 }
        );
      }
      firebaseUser = await adminAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: firebaseUser.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Clean up invalid course IDs
    const originalPath = user.myPath || [];
    const validPath = originalPath.filter((id: string) => mongoose.Types.ObjectId.isValid(id));
    const removedCount = originalPath.length - validPath.length;

    if (removedCount > 0) {
      user.myPath = validPath;
      await user.save();
      
      return NextResponse.json({ 
        message: 'Invalid course IDs removed from My Path',
        removedCount,
        validCourseIds: validPath 
      });
    }

    return NextResponse.json({ 
      message: 'No invalid course IDs found',
      validCourseIds: validPath 
    });
  } catch (error) {
    console.error('Error cleaning up myPath:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: errorMessage 
    }, { status: 500 });
  }
}
