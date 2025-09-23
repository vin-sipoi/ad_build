import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Course } from '@/models/Course';
import { withAuth, AuthUser } from '@/lib/auth';

// GET /api/admin/courses/[id] - Get single course
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const course = await Course.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course', success: false },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/courses/[id] - Update course
export const PATCH = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const body = await req.json();
    const { title } = body;

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found', success: false },
        { status: 404 }
      );
    }

    // Update slug if title changed
    const updateData: Record<string, unknown> = {
      ...body,
      updatedBy: user.id,
    };

    if (title && title !== course.title) {
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, '-')
        .trim();

      // Check if new slug already exists
      const existingCourse = await Course.findOne({ slug, _id: { $ne: id } });
      if (existingCourse) {
        return NextResponse.json(
          { error: 'Course with this title already exists', success: false },
          { status: 400 }
        );
      }

      updateData.slug = slug;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    return NextResponse.json({
      success: true,
      data: updatedCourse
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course', success: false },
      { status: 500 }
    );
  }
}, ['admin']);

// DELETE /api/admin/courses/[id] - Delete course
export const DELETE = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found', success: false },
        { status: 404 }
      );
    }

    await Course.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course', success: false },
      { status: 500 }
    );
  }
}, ['admin']);
