import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { MentorApplication } from '@/models/MentorApplication';
import { withAuth } from '@/lib/auth';

// GET /api/admin/mentor-applications - List all mentor applications
export async function GET() {
  try {
    await dbConnect();
    
    const applications = await MentorApplication.find()
      .populate('userId', 'name email profile')
      .populate('decidedBy', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching mentor applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mentor applications', success: false },
      { status: 500 }
    );
  }
}

// POST /api/admin/mentor-applications - Submit mentor application (for learners)
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { bio, expertiseTracks } = body;

    // Validate required fields
    if (!bio || !expertiseTracks || expertiseTracks.length === 0) {
      return NextResponse.json(
        { error: 'Bio and expertise tracks are required', success: false },
        { status: 400 }
      );
    }

    // Check if user already has a pending or approved application
    const existingApplication = await MentorApplication.findOne({
      userId: user.id,
      status: { $in: ['pending', 'approved'] }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You already have a pending or approved mentor application', success: false },
        { status: 400 }
      );
    }

    const application = await MentorApplication.create({
      userId: user.id,
      bio,
      expertiseTracks,
    });

    const populatedApplication = await MentorApplication.findById(application._id)
      .populate('userId', 'name email profile');

    return NextResponse.json({
      success: true,
      data: populatedApplication
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating mentor application:', error);
    return NextResponse.json(
      { error: 'Failed to submit mentor application', success: false },
      { status: 500 }
    );
  }
}, ['learner']);
