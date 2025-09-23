import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Lesson } from '@/models/Lesson';
import { Progress } from '@/models/Progress';
import { withAuth, AuthUser } from '@/lib/auth';

// GET /api/admin/lessons/[id] - Get lesson by ID
export const GET = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const lesson = await Lesson.findById(id)
      .populate('topicId', 'title slug courseId')
      .populate({
        path: 'topicId',
        populate: {
          path: 'courseId',
          select: 'title slug'
        }
      });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found', success: false },
        { status: 404 }
      );
    }

    // Get completion stats for this lesson
    const completionStats = await Progress.aggregate([
      { $match: { lessonId: lesson._id } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          },
          averageScore: { $avg: '$score' }
        }
      }
    ]);

    const stats = completionStats[0] || {
      totalAttempts: 0,
      completedCount: 0,
      averageScore: 0
    };

    return NextResponse.json({
      success: true,
      data: {
        ...lesson.toObject(),
        stats: {
          totalAttempts: stats.totalAttempts,
          completedCount: stats.completedCount,
          completionRate: stats.totalAttempts > 0 ? (stats.completedCount / stats.totalAttempts * 100).toFixed(1) : '0',
          averageScore: stats.averageScore ? stats.averageScore.toFixed(1) : '0'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lesson', success: false },
      { status: 500 }
    );
  }
}, ['admin', 'mentor']);

// PUT /api/admin/lessons/[id] - Update lesson
export const PUT = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const body = await req.json();
    const {
      title,
      description,
      type,
      difficulty,
      estimatedMinutes,
      content,
      videoUrl,
      resources,
      quiz,
      order,
      isActive
    } = body;

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found', success: false },
        { status: 404 }
      );
    }

    // Update slug if title changed
    let slug = lesson.slug;
    if (title && title !== lesson.title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      // Check for existing slug in the same topic
      const existingLesson = await Lesson.findOne({
        slug,
        topicId: lesson.topicId,
        _id: { $ne: lesson._id }
      });
      if (existingLesson) {
        return NextResponse.json(
          { error: 'A lesson with this title already exists in this topic', success: false },
          { status: 400 }
        );
      }
    }

    // Validate type-specific requirements
    if (type === 'video' && videoUrl === '') {
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

    // Update lesson fields
    const updateData: Record<string, unknown> = {
      updatedAt: new Date()
    };

    if (title !== undefined) {
      updateData.title = title;
      updateData.slug = slug;
    }
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (difficulty !== undefined) updateData.difficulty = difficulty;
    if (estimatedMinutes !== undefined) updateData.estimatedMinutes = estimatedMinutes;
    if (content !== undefined) updateData.content = content;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (resources !== undefined) updateData.resources = resources;
    if (quiz !== undefined) updateData.quiz = quiz;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedLesson = await Lesson.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
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
      data: updatedLesson,
      message: 'Lesson updated successfully'
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to update lesson', success: false },
      { status: 500 }
    );
  }
}, ['admin', 'mentor']);

// DELETE /api/admin/lessons/[id] - Delete lesson
export const DELETE = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found', success: false },
        { status: 404 }
      );
    }

    // Check if lesson has progress records
    const progressCount = await Progress.countDocuments({ lessonId: lesson._id });
    if (progressCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete lesson that has learner progress. Archive it instead.', success: false },
        { status: 400 }
      );
    }

    await Lesson.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    return NextResponse.json(
      { error: 'Failed to delete lesson', success: false },
      { status: 500 }
    );
  }
}, ['admin']);
