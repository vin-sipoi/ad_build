import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Topic } from '@/models/Topic';
import '@/models/Course'; // Register Course model for Mongoose schema
import { Lesson } from '@/models/Lesson';
import { withAuth, AuthUser } from '@/lib/auth';

// GET /api/admin/topics/[id] - Get topic by ID
export const GET = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const topic = await Topic.findById(id)
      .populate('courseId', 'title slug');

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found', success: false },
        { status: 404 }
      );
    }

    // Get lessons count for this topic
    const lessonsCount = await Lesson.countDocuments({ topicId: topic._id });

    return NextResponse.json({
      success: true,
      data: {
        ...topic.toObject(),
        lessonsCount
      }
    });
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic', success: false },
      { status: 500 }
    );
  }
}, ['admin', 'mentor']);

// PUT /api/admin/topics/[id] - Update topic
export const PUT = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const body = await req.json();
    const { title, description, track, estimatedHours, prerequisites, order, isActive } = body;

    const topic = await Topic.findById(id);
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found', success: false },
        { status: 404 }
      );
    }

    // Update slug if title changed
    let slug = topic.slug;
    if (title && title !== topic.title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Check for existing slug in the same course
      const existingTopic = await Topic.findOne({
        slug,
        courseId: topic.courseId,
        _id: { $ne: topic._id }
      });
      if (existingTopic) {
        return NextResponse.json(
          { error: 'A topic with this title already exists in this course', success: false },
          { status: 400 }
        );
      }
    }

    // Update topic fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = slug;
    }
    if (description !== undefined) updateData.description = description;
    if (track !== undefined) updateData.track = track;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (prerequisites !== undefined) updateData.prerequisites = prerequisites;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedTopic = await Topic.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('courseId', 'title slug');

    return NextResponse.json({
      success: true,
      data: updatedTopic,
      message: 'Topic updated successfully'
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { error: 'Failed to update topic', success: false },
      { status: 500 }
    );
  }
}, ['admin', 'mentor']);

// DELETE /api/admin/topics/[id] - Delete topic
export const DELETE = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const topic = await Topic.findById(id);
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found', success: false },
        { status: 404 }
      );
    }

    // Check if topic has lessons
    const lessonsCount = await Lesson.countDocuments({ topicId: topic._id });
    if (lessonsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete topic that contains lessons. Delete lessons first.', success: false },
        { status: 400 }
      );
    }

    await Topic.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { error: 'Failed to delete topic', success: false },
      { status: 500 }
    );
  }
}, ['admin']);
