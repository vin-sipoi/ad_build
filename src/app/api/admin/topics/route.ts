import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Topic } from '@/models/Topic';
import { Course } from '@/models/Course';
import { withAuth, AuthUser } from '@/lib/auth';

// GET /api/admin/topics - Get all topics with filtering and pagination
export const GET = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const courseId = searchParams.get('courseId') || '';
    const track = searchParams.get('track') || '';
    
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (courseId) {
      filter.courseId = courseId;
    }
    if (track) {
      filter.track = track;
    }
    
    const [topics, total] = await Promise.all([
      Topic.find(filter)
        .populate('courseId', 'title slug')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Topic.countDocuments(filter)
    ]);
    
    return NextResponse.json({
      success: true,
      data: topics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics', success: false },
      { status: 500 }
    );
  }
}, ['admin', 'mentor']);

// POST /api/admin/topics - Create a new topic
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { title, description, courseId, track, estimatedHours, prerequisites, order } = body;
    
    // Validate required fields
    if (!title || !description || !courseId || !track) {
      return NextResponse.json(
        { error: 'Title, description, courseId, and track are required', success: false },
        { status: 400 }
      );
    }
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found', success: false },
        { status: 404 }
      );
    }
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    // Check for existing slug in the same course
    const existingTopic = await Topic.findOne({ slug, courseId });
    if (existingTopic) {
      return NextResponse.json(
        { error: 'A topic with this title already exists in this course', success: false },
        { status: 400 }
      );
    }
    
    // Create new topic
    const topic = new Topic({
      title,
      description,
      slug,
      courseId,
      track,
      estimatedHours: estimatedHours || 0,
      prerequisites: prerequisites || [],
      order: order || 0,
      createdBy: user.id
    });
    
    await topic.save();
    
    // Populate course data for response
    const populatedTopic = await Topic.findById(topic._id)
      .populate('courseId', 'title slug');
    
    return NextResponse.json({
      success: true,
      data: populatedTopic,
      message: 'Topic created successfully'
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic', success: false },
      { status: 500 }
    );
  }
}, ['admin', 'mentor']);
