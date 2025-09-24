import { NextResponse } from 'next/server';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Lesson } from '@/models/Lesson';
import { MentorApplication } from '@/models/MentorApplication';
import { verifyAdminSession } from '@/lib/admin-auth';

export async function GET() {
  try {
    // Verify admin authentication
    const adminUser = await verifyAdminSession();
    if (!adminUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get statistics in parallel for better performance
    const [
      totalUsers,
      totalCourses,
      totalLessons,
      pendingApplications,
      recentUsers,
      publishedCourses,
      draftCourses
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Lesson.countDocuments(),
      MentorApplication.countDocuments({ status: 'pending' }),
      User.countDocuments({ 
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        } 
      }),
      Course.countDocuments({ status: 'published' }),
      Course.countDocuments({ status: 'draft' })
    ]);

    // Calculate growth percentages (comparing to previous month)
    const previousMonthStart = new Date();
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 2);
    previousMonthStart.setDate(1);
    
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);

    const [
      previousMonthUsers,
      previousMonthCourses,
      previousMonthLessons,
      previousMonthApplications
    ] = await Promise.all([
      User.countDocuments({ 
        createdAt: { 
          $gte: previousMonthStart, 
          $lt: lastMonthStart 
        } 
      }),
      Course.countDocuments({ 
        createdAt: { 
          $gte: previousMonthStart, 
          $lt: lastMonthStart 
        } 
      }),
      Lesson.countDocuments({ 
        createdAt: { 
          $gte: previousMonthStart, 
          $lt: lastMonthStart 
        } 
      }),
      MentorApplication.countDocuments({ 
        createdAt: { 
          $gte: previousMonthStart, 
          $lt: lastMonthStart 
        } 
      })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const userGrowth = calculateGrowth(recentUsers, previousMonthUsers);
    const courseGrowth = calculateGrowth(totalCourses, previousMonthCourses);
    const lessonGrowth = calculateGrowth(totalLessons, previousMonthLessons);
    const applicationGrowth = calculateGrowth(pendingApplications, previousMonthApplications);

    const stats = {
      totalUsers: {
        value: totalUsers,
        growth: userGrowth,
        label: 'Total Users'
      },
      totalCourses: {
        value: totalCourses,
        growth: courseGrowth,
        label: 'Total Courses',
        breakdown: {
          published: publishedCourses,
          draft: draftCourses
        }
      },
      totalLessons: {
        value: totalLessons,
        growth: lessonGrowth,
        label: 'Lessons Created'
      },
      pendingApplications: {
        value: pendingApplications,
        growth: applicationGrowth,
        label: 'Pending Applications'
      }
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
