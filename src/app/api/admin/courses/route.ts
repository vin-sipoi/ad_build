import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Course } from '@/models/Course';
import { withAuth } from '@/lib/auth';

// GET /api/admin/courses - List all courses
export async function GET() {
  try {
    await dbConnect();
    
    const courses = await Course.find()
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses', success: false },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses - Create new course
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { title, track, credits, estimatedHours, description, level } = body;

    // Validate required fields
    if (!title || !track || !credits || !estimatedHours || !description) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Check if slug already exists
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course with this title already exists', success: false },
        { status: 400 }
      );
    }

    // Get next order number
    const lastCourse = await Course.findOne().sort({ order: -1 });
    const order = (lastCourse?.order || 0) + 1;

    const course = await Course.create({
      title,
      slug,
      track,
      credits: Number(credits),
      estimatedHours: Number(estimatedHours),
      description,
      level,
      order,
      createdBy: user.id,
      updatedBy: user.id,
    });

    const populatedCourse = await Course.findById(course._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: populatedCourse
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course', success: false },
      { status: 500 }
    );
  }
}, ['admin']);
