import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Lesson } from '@/models/Lesson';
import { Topic } from '@/models/Topic';
import { withAuth, AuthUser } from '@/lib/auth';

// GET /api/admin/lessons - Get all lessons with filtering and pagination
export const GET = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const topicId = searchParams.get('topicId') || '';
    const type = searchParams.get('type') || '';
    const difficulty = searchParams.get('difficulty') || '';
    
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (topicId) {
      filter.topicId = topicId;
    }
    if (type) {
      filter.type = type;
    }
    if (difficulty) {
      filter.difficulty = difficulty;
    }
    
    const [lessons, total] = await Promise.all([
      Lesson.find(filter)
        .populate('topicId', 'title slug courseId')
        .populate({
          path: 'topicId',
          populate: {
            path: 'courseId',
            select: 'title slug'
          }
        })
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lesson.countDocuments(filter)
    ]);
    
    return NextResponse.json({
      success: true,
      data: lessons,
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
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons', success: false },
      { status: 500 }
    );
  }
}, ['admin', 'mentor']);

// POST /api/admin/lessons - Create a new lesson
export const POST = withAuth(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { 
      title, 
      description, 
      topicId, 
      type, 
      difficulty, 
      estimatedMinutes, 
      content, 
      videoUrl, 
      resources, 
      quiz,
      order 
    } = body;
    
    // Validate required fields
    if (!title || !description || !topicId || !type) {
      return NextResponse.json(
        { error: 'Title, description, topicId, and type are required', success: false },
        { status: 400 }
      );
    }
    
    // Check if topic exists
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic not found', success: false },
        { status: 404 }
      );
    }
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
    
    // Check for existing slug in the same topic
    const existingLesson = await Lesson.findOne({ slug, topicId });
    if (existingLesson) {
      return NextResponse.json(
        { error: 'A lesson with this title already exists in this topic', success: false },
        { status: 400 }
      );
    }
    
    // Validate lesson type-specific requirements
    if (type === 'video' && !videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required for video lessons', success: false },
        { status: 400 }
      );
    }
    
    if (type === 'quiz' && (!quiz || !quiz.questions || quiz.questions.length === 0)) {
      return NextResponse.json(
        { error: 'Quiz questions are required for quiz lessons', success: false },
        { status: 400 }
      );
    }
    
    // Create new lesson
    const lesson = new Lesson({
      title,
      description,
      slug,
      topicId,
      type,
      difficulty: difficulty || 'beginner',
      estimatedMinutes: estimatedMinutes || 0,
      content: content || '',
      videoUrl: videoUrl || '',
      resources: resources || [],
      quiz: quiz || { questions: [], passingScore: 70 },
      order: order || 0,
      createdBy: user.id
    });
    
    await lesson.save();
    
    // Populate topic and course data for response
    const populatedLesson = await Lesson.findById(lesson._id)
      .populate('topicId', 'title slug courseId')
      .populate({
        path: 'topicId',
        populate: {
          path: 'courseId',
          select: 'title slug'
        }
      });
    
    return NextResponse.json({
      success: true,
      data: populatedLesson,
      message: 'Lesson created successfully'
    });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson', success: false },
      { status: 500 }
    );
  }
}, ['admin', 'mentor']);
