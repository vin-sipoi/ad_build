import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { adminAuth } from '@/lib/firebase-admin';

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

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    await connectDB();

    // Find user by email from Firebase, or create if doesn't exist
    let user = await User.findOne({ email: firebaseUser.email });
    
    if (!user) {
      // Auto-create user if they authenticated via Firebase but don't exist in MongoDB yet
      user = await User.create({
        email: firebaseUser.email,
        name: firebaseUser.name || firebaseUser.email?.split('@')[0] || 'User',
        roles: ['learner'],
        myPath: [courseId], // Add the course to their path immediately
        profile: {},
      });
      
      return NextResponse.json({ 
        message: 'User created and course added to My Path',
        newUser: true 
      });
    }

    // User exists, add course if not already in myPath
    const currentPath = Array.isArray(user.myPath) ? [...user.myPath] : [];
    if (!Array.isArray(user.myPath)) {
      user.myPath = currentPath;
    }

    if (!currentPath.includes(courseId)) {
      currentPath.push(courseId);
      user.myPath = currentPath;
      await user.save();
    }

    return NextResponse.json({ message: 'Course added to My Path' });
  } catch (error) {
    console.error('Error in POST /api/user/my-path:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: errorMessage 
    }, { status: 500 });
  }
}