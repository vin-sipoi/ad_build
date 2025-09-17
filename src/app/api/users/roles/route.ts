// API endpoint for user role management
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { UserRole } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('adamur_academy');
    const user = await db.collection('users').findOne({ uid: userId });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      role: user.role || 'learner',
      journeyStage: user.journeyStage || 'residency'
    });
    
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role, journeyStage } = body;

    if (!userId || !role) {
      return NextResponse.json({ 
        error: 'User ID and role are required' 
      }, { status: 400 });
    }

    const validRoles: UserRole[] = [
      'learner', 'mentor', 'investor', 'superadmin', 'partner_admin'
    ];
    
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('adamur_academy');
    
    const updateData: { 
      role: string;
      updatedAt: Date;
      journeyStage?: string;
    } = { 
      role,
      updatedAt: new Date()
    };
    
    if (journeyStage) {
      updateData.journeyStage = journeyStage;
    }

    const result = await db.collection('users').updateOne(
      { uid: userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, role, journeyStage });
    
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
