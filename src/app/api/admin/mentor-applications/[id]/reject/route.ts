import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { MentorApplication } from '@/models/MentorApplication';
import { withAuth, AuthUser } from '@/lib/auth';

// POST /api/admin/mentor-applications/[id]/reject - Reject mentor application
export const POST = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const body = await req.json();
    const { rejectionReason } = body;

    const application = await MentorApplication.findById(id);
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found', success: false },
        { status: 404 }
      );
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application has already been processed', success: false },
        { status: 400 }
      );
    }

    // Update application status
    application.status = 'rejected';
    application.decidedBy = user.id;
    application.decidedAt = new Date();
    if (rejectionReason) {
      application.rejectionReason = rejectionReason;
    }
    await application.save();

    const updatedApplication = await MentorApplication.findById(application._id)
      .populate('userId', 'name email profile')
      .populate('decidedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: updatedApplication,
      message: 'Mentor application rejected'
    });
  } catch (error) {
    console.error('Error rejecting mentor application:', error);
    return NextResponse.json(
      { error: 'Failed to reject mentor application', success: false },
      { status: 500 }
    );
  }
}, ['admin']);
