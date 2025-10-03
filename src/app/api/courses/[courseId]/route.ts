// API endpoint for a single course - Database integration
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Course } from '@/models/Course';
import { Topic } from '@/models/Topic';
import { Lesson, type ILessonQuizQuestion } from '@/models/Lesson';
import { Progress } from '@/models/Progress';
import { User } from '@/models/User';
import { getSession } from '@/lib/auth-utils';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  
  try {
    await dbConnect();
    
    // Get course by ID or slug (without populate first to avoid errors)
    let course = await Course.findById(courseId).catch(() => null);
    
    if (!course) {
      // Try finding by slug if ID lookup failed
      course = await Course.findOne({ slug: courseId });
    }

    if (!course) {
      return NextResponse.json({ error: `Course with id/slug ${courseId} not found` }, { status: 404 });
    }
    
    // Try to populate createdBy, but don't fail if it doesn't exist
    try {
      await course.populate('createdBy', 'name email');
    } catch (populateError) {
      console.log('Could not populate createdBy:', populateError);
    }

    // Get authenticated user to fetch their progress
    let userId = null;
    try {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ') && adminAuth) {
        const token = authHeader.split(' ')[1];
        const decoded = await adminAuth.verifyIdToken(token);
        if (decoded?.email) {
          const user = await User.findOne({ email: decoded.email.toLowerCase() });
          if (user) userId = user._id;
        }
      }
      
      if (!userId) {
        const session = await getSession(req);
        if (session?.user?.id) {
          const user = await User.findById(session.user.id);
          if (user) userId = user._id;
        }
      }
    } catch (error) {
      console.log('Could not authenticate user for progress tracking:', error);
    }

    // Fetch user's progress if authenticated
    const userProgressMap = new Map();
    if (userId) {
      const progressRecords = await Progress.find({
        userId,
        courseId,
        status: 'completed'
      }).select('lessonId');
      
      progressRecords.forEach(record => {
        userProgressMap.set(record.lessonId.toString(), true);
      });
    }

    // Get topics for this course
    const topics = await Topic.find({ courseId: courseId, status: 'published' })
      .sort({ order: 1 })
      .lean();

    // Get lessons for each topic
    const topicsWithLessons = await Promise.all(
      topics.map(async (topic) => {
        const lessons = await Lesson.find({ topicId: topic._id, status: 'published' })
          .sort({ order: 1 })
          .select('title slug description type difficulty estimatedMinutes videoUrl order status content quiz')
          .lean();

        console.log(`Topic "${topic.title}" has ${lessons.length} published lessons`);
        if (lessons.length > 0) {
          console.log(`First lesson content sample:`, lessons[0].content);
        }

        const lessonSummaries = lessons.map(lesson => {
          const normalizedType = lesson.type === 'article' ? 'reading' : lesson.type;
          const lessonContent = typeof lesson.content === 'string'
            ? lesson.content
            : lesson.content?.html || '';

          const quizData = lesson.quiz && Array.isArray(lesson.quiz.questions)
            ? {
                passingScore: lesson.quiz.passingScore ?? 70,
                questions: (lesson.quiz.questions as ILessonQuizQuestion[]).map((question) => ({
                  question: question.question,
                  options: question.options || [],
                  correctAnswer: question.correctAnswer,
                  explanation: question.explanation,
                })),
              }
            : undefined;

          const lessonId = String(lesson._id);
          const isLessonCompleted = userProgressMap.has(lessonId);

          return {
            id: lessonId,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description || '',
            type: normalizedType,
            difficulty: lesson.difficulty,
            duration: lesson.estimatedMinutes || 0,
            videoUrl: lesson.videoUrl || null,
            content: lessonContent,
            estimatedTime: `${lesson.estimatedMinutes || 0} min`,
            isCompleted: isLessonCompleted,
            isLocked: false, // TODO: Add lesson progression logic
            order: lesson.order,
            quiz: quizData,
          };
        });

        // Check if all lessons in this topic are completed
        const topicCompleted = lessonSummaries.length > 0 && lessonSummaries.every(l => l.isCompleted);

        return {
          id: String(topic._id),
          title: topic.title,
          slug: topic.slug,
          description: topic.description || '',
          order: topic.order,
          isCompleted: topicCompleted,
          lessons: lessonSummaries,
          subtopics: lessonSummaries,
        };
      })
    );

    // Transform to match the expected format for learners
    const courseObj = course.toObject();
    const transformedCourse = {
      _id: courseObj._id,
      id: courseObj._id.toString(),
      title: courseObj.title,
      description: courseObj.description,
      instructor: courseObj.createdBy?.name || courseObj.createdBy?.email || 'Adamur Academy',
      thumbnail: courseObj.thumbnail || '/course-placeholder.svg',
      difficulty: courseObj.level || 'beginner', // Use level for difficulty, not track
      track: courseObj.track, // Add track as separate field
      duration: `${courseObj.estimatedHours || 0} hours`,
      estimatedHours: courseObj.estimatedHours || 0,
      creditsRequired: courseObj.credits || 0,
      creditsReward: 100, // Fixed reward for now
      creditReward: 100, // backward compatibility
      enrolledCount: 0, // TODO: Add enrollment tracking
      rating: 4.8, // TODO: Add rating system
      tags: courseObj.tags || [],
      isEnrolled: false, // TODO: Add user enrollment tracking
      progress: 0, // TODO: Add user progress tracking
      modules: [{
        id: '1',
        title: courseObj.title,
        description: courseObj.description,
        topics: topicsWithLessons
      }],
      createdBy: courseObj.createdBy?.name || courseObj.createdBy?.email || 'Adamur Academy',
      createdAt: courseObj.createdAt,
      updatedAt: courseObj.updatedAt,
    };

    return NextResponse.json(transformedCourse);
  } catch (error) {
    console.error(`Error fetching course with id/slug "${courseId}":`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    
    // Fallback to static data if database fails
    try {
      const coursesModule = await import('@/data/courses');
      const course = coursesModule.courses.find((c: { id: string }) => c.id === courseId);
      if (course) {
        console.log('Using fallback static data for course:', courseId);
        return NextResponse.json(course);
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch course', details: errorMessage },
      { status: 500 }
    );
  }
}
