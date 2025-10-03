// API endpoint for courses - Database integration
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Course } from '@/models/Course';
import { Topic } from '@/models/Topic';
import { Lesson } from '@/models/Lesson';

export async function GET() {
  try {
    await dbConnect();
    const courses = await Course.find({ status: 'published' })
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    // Get topic counts and lesson times for each course
    const courseIds = courses.map(c => c._id);
    
    // Get topic counts
    const topicCounts = await Topic.aggregate([
      { 
        $match: { 
          courseId: { $in: courseIds },
          status: 'published'
        } 
      },
      { 
        $group: { 
          _id: '$courseId', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Get total lesson time per course
    const lessonTimes = await Lesson.aggregate([
      {
        $match: {
          status: 'published'
        }
      },
      {
        $lookup: {
          from: 'topics',
          localField: 'topicId',
          foreignField: '_id',
          as: 'topic'
        }
      },
      {
        $unwind: '$topic'
      },
      {
        $match: {
          'topic.courseId': { $in: courseIds },
          'topic.status': 'published'
        }
      },
      {
        $group: {
          _id: '$topic.courseId',
          totalMinutes: { $sum: '$estimatedMinutes' }
        }
      }
    ]);

    // Create maps for quick lookup
    const topicCountMap = new Map(
      topicCounts.map(tc => [tc._id.toString(), tc.count])
    );
    
    const lessonTimeMap = new Map(
      lessonTimes.map(lt => [lt._id.toString(), lt.totalMinutes])
    );

    // Transform to match the expected format for learners
    const transformedCourses = await Promise.all(courses.map(async course => {
      const courseObj = course.toObject();
      const courseIdStr = courseObj._id.toString();
      const topicCount = topicCountMap.get(courseIdStr) || 0;
      
      // Calculate total hours from lesson minutes
      const totalMinutes = lessonTimeMap.get(courseIdStr) || 0;
      const totalHours = Math.ceil(totalMinutes / 60); // Round up to nearest hour

      return {
        _id: courseObj._id,
        id: courseIdStr,
        title: courseObj.title,
        description: courseObj.description,
        instructor: courseObj.createdBy?.name || courseObj.createdBy?.email || 'Adamur Academy',
        thumbnail: courseObj.thumbnail || '/course-placeholder.svg',
        difficulty: courseObj.level || 'beginner',
        track: courseObj.track,
        duration: `${totalHours} hours`,
        estimatedHours: totalHours,
        creditsRequired: courseObj.credits || 0,
        creditsReward: 100,
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
          topics: Array(topicCount).fill({ id: '', title: '' }) // Placeholder for topic count
        }],
        createdBy: courseObj.createdBy?.name || courseObj.createdBy?.email || 'Adamur Academy',
        createdAt: courseObj.createdAt,
        updatedAt: courseObj.updatedAt,
      };
    }));

    return NextResponse.json(transformedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    // Fallback to static data if database fails
    try {
      const coursesModule = await import('@/data/courses');
      return NextResponse.json(coursesModule.courses);
    } catch {
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }
  }
}
