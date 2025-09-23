// API endpoint for courses - Database integration
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Course } from '@/models/Course';

export async function GET() {
  try {
    await dbConnect();
    const courses = await Course.find({ status: 'published' })
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 });

    // Transform to match the expected format for learners
    const transformedCourses = courses.map(course => {
      const courseObj = course.toObject();
      return {
        _id: courseObj._id,
        id: courseObj._id.toString(),
        title: courseObj.title,
        description: courseObj.description,
        instructor: courseObj.createdBy?.name || courseObj.createdBy?.email || 'Adamur Academy',
        thumbnail: courseObj.thumbnail || '/course-placeholder.svg',
        difficulty: courseObj.difficulty,
        duration: courseObj.duration,
        estimatedHours: courseObj.estimatedHours,
        creditsRequired: courseObj.creditsRequired || 0,
        creditsReward: courseObj.creditsReward || 100,
        creditReward: courseObj.creditsReward || 100, // backward compatibility
        enrolledCount: 0, // TODO: Add enrollment tracking
        rating: 4.8, // TODO: Add rating system
        tags: courseObj.tags || [],
        isEnrolled: false, // TODO: Add user enrollment tracking
        progress: 0, // TODO: Add user progress tracking
        modules: courseObj.modules || [],
        createdBy: courseObj.createdBy?.name || courseObj.createdBy?.email || 'Adamur Academy',
        createdAt: courseObj.createdAt,
        updatedAt: courseObj.updatedAt,
      };
    });

    return NextResponse.json(transformedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    // Fallback to static data if database fails
    try {
      const { courses } = require('@/data/courses');
      return NextResponse.json(courses);
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }
  }
}
