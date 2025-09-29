// API endpoint for a single course - Database integration
import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Course } from '@/models/Course';
import { Topic } from '@/models/Topic';
import { Lesson } from '@/models/Lesson';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  
  try {
    await dbConnect();
    
    // Get course
    const course = await Course.findById(courseId)
      .populate('createdBy', 'name email');

    if (!course) {
      return NextResponse.json({ error: `Course with id ${courseId} not found` }, { status: 404 });
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
          .select('title slug description type difficulty estimatedMinutes videoUrl order status content')
          .lean();

        console.log(`Topic "${topic.title}" has ${lessons.length} published lessons`);
        if (lessons.length > 0) {
          console.log(`First lesson content sample:`, lessons[0].content);
        }

        return {
          id: String(topic._id),
          title: topic.title,
          slug: topic.slug,
          description: topic.description || '',
          order: topic.order,
          isCompleted: false, // TODO: Add user progress tracking
          lessons: lessons.map(lesson => ({
            id: String(lesson._id),
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description || '',
            type: lesson.type,
            difficulty: lesson.difficulty,
            duration: lesson.estimatedMinutes || 0,
            videoUrl: lesson.videoUrl || null,
            content: lesson.content?.html || (typeof lesson.content === 'string' ? lesson.content : '') || '',
            estimatedTime: `${lesson.estimatedMinutes || 0} min`,
            isCompleted: false, // TODO: Add user progress tracking
            isLocked: false, // TODO: Add lesson progression logic
            order: lesson.order
          }))
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
      difficulty: courseObj.level || courseObj.track || 'beginner',
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
    console.error(`Error fetching course:`, error);
    
    // Fallback to static data if database fails
    try {
      const coursesModule = await import('@/data/courses');
      const course = coursesModule.courses.find((c: { id: string }) => c.id === courseId);
      if (course) {
        return NextResponse.json(course);
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
