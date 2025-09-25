import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Progress } from '@/models/Progress';
import { Course } from '@/models/Course';
import { Topic } from '@/models/Topic';
import { Lesson } from '@/models/Lesson';
import { User } from '@/models/User';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    await dbConnect();

    const { uid: firebaseUid } = await params;

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's email from Firebase UID
    let userEmail: string;
    try {
      if (!adminAuth) {
        return NextResponse.json(
          { error: 'Firebase admin not initialized' },
          { status: 500 }
        );
      }
      
      const userRecord = await adminAuth.getUser(firebaseUid);
      userEmail = userRecord.email || '';
      if (!userEmail) {
        return NextResponse.json(
          { error: 'User email not found' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error getting Firebase user:', error);
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Find the User document in MongoDB by email
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Fetch user progress records using MongoDB User ObjectId
    const userProgressRecords = await Progress.find({ userId: user._id })
      .populate({
        path: 'courseId',
        select: 'title slug'
      })
      .lean();

    if (!userProgressRecords || userProgressRecords.length === 0) {
      return NextResponse.json({
        courses: [],
        stats: {
          totalProgress: 0,
          totalCreditsEarned: 0,
          totalTimeSpent: 0,
          coursesStarted: 0,
          coursesCompleted: 0
        }
      });
    }

    // Group progress by course
    const courseProgressMap = new Map();
    
    for (const progress of userProgressRecords) {
      const courseId = progress.courseId._id.toString();
      
      if (!courseProgressMap.has(courseId)) {
        courseProgressMap.set(courseId, {
          courseId: courseId,
          courseTitle: progress.courseId.title,
          courseSlug: progress.courseId.slug,
          progressRecords: [],
          totalCreditsEarned: 0,
          totalTimeSpent: 0,
          lastAccessed: progress.updatedAt
        });
      }
      
      const courseData = courseProgressMap.get(courseId);
      courseData.progressRecords.push(progress);
      courseData.totalCreditsEarned += progress.creditsEarned || 0;
      courseData.totalTimeSpent += progress.timeSpent || 0;
      
      // Update last accessed if this record is more recent
      if (progress.updatedAt > courseData.lastAccessed) {
        courseData.lastAccessed = progress.updatedAt;
      }
    }

    // Build detailed progress data for each course
    const coursesProgress = [];
    let totalCreditsEarned = 0;
    let totalTimeSpent = 0;
    let coursesCompleted = 0;

    for (const [courseId, courseData] of courseProgressMap.entries()) {
      // Get course structure
      const course = await Course.findById(courseId).lean();
      if (!course) continue;

      const topics = await Topic.find({ courseId }).lean();
      const totalTopics = topics.length;

      // Calculate total lessons across all topics
      let totalLessons = 0;
      const topicProgress = [];

      for (const topic of topics) {
        const lessons = await Lesson.find({ topicId: topic._id }).lean();
        const topicLessonsCount = lessons.length;
        totalLessons += topicLessonsCount;

        // Check topic progress
        const topicProgressRecords = courseData.progressRecords.filter(
          (p: { topicId?: string | { toString(): string } }) => 
            p.topicId && p.topicId.toString() === (topic._id as { toString(): string }).toString()
        );

        const completedLessonsInTopic = topicProgressRecords.filter(
          (p: { completed?: boolean }) => p.completed
        ).length;

        topicProgress.push({
          topicId: (topic._id as { toString(): string }).toString(),
          title: topic.title,
          completed: completedLessonsInTopic === topicLessonsCount && topicLessonsCount > 0,
          lessonsCompleted: completedLessonsInTopic,
          totalLessons: topicLessonsCount
        });
      }

      // Calculate overall course progress
      const completedLessons = courseData.progressRecords.filter(
        (p: { completed?: boolean }) => p.completed
      ).length;
      
      const completedTopics = topicProgress.filter(t => t.completed).length;
      const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      coursesProgress.push({
        courseId: courseId,
        courseTitle: courseData.courseTitle,
        courseSlug: courseData.courseSlug,
        totalTopics,
        completedTopics,
        totalLessons,
        completedLessons,
        timeSpent: courseData.totalTimeSpent,
        creditsEarned: courseData.totalCreditsEarned,
        lastAccessed: courseData.lastAccessed,
        progress: Math.round(progress),
        topics: topicProgress
      });

      totalCreditsEarned += courseData.totalCreditsEarned;
      totalTimeSpent += courseData.totalTimeSpent;
      if (progress >= 100) coursesCompleted++;
    }

    // Calculate overall stats
    const coursesStarted = coursesProgress.length;
    const totalProgress = coursesStarted > 0 
      ? coursesProgress.reduce((sum, course) => sum + course.progress, 0) / coursesStarted
      : 0;

    const stats = {
      totalProgress: Math.round(totalProgress),
      totalCreditsEarned,
      totalTimeSpent,
      coursesStarted,
      coursesCompleted
    };

    return NextResponse.json({
      courses: coursesProgress.sort((a, b) => 
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      ),
      stats
    });

  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}