// API endpoint to fetch user data
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    const { uid } = await params;
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Add connection timeout and retry logic
    const client = await Promise.race([
      clientPromise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('MongoDB connection timeout')), 10000)
      )
    ]);
    
    const db = client.db('adamur_academy');
    const user = await db.collection('users').findOne({ uid });
    
    if (user) {
      return NextResponse.json({
        name: user.name || 'Founder',
        email: user.email || '',
        role: user.role || 'learner',
        journeyStage: user.journeyStage || 'residency',
        credits: user.credits || 500,
        nftBadges: user.nftBadges || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    }
  } catch (error) {
    console.error('Error fetching user from DB, falling back to default:', error);
  }

  // Fallback to default user object if DB fails or user not found
  return NextResponse.json({
    name: 'Founder',
    email: '',
    role: 'learner',
    journeyStage: 'residency',
    credits: 500,
    completedCourses: [],
    unlockedModules: []
  });
}
