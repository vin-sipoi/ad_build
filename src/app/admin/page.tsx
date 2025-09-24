import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  BarChart3,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import { requireAdminAuth } from '@/lib/admin-auth';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Lesson } from '@/models/Lesson';
import { MentorApplication } from '@/models/MentorApplication';

// Helper function to fetch admin stats
async function fetchAdminStats() {
  try {
    // Ensure database connection is established
    await dbConnect();
    // Calculate date for last month comparison
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    // Get statistics in parallel for better performance
    const [
      totalUsers,
      totalCourses,
      totalLessons,
      pendingApplications,
      recentUsers,
      publishedCourses,
      completedLessons,
      approvedApplications
    ] = await Promise.all([
      User.countDocuments({}),
      Course.countDocuments({}),
      Lesson.countDocuments({}),
      MentorApplication.countDocuments({ status: 'pending' }),
      User.countDocuments({ createdAt: { $gte: lastMonth } }),
      Course.countDocuments({ createdAt: { $gte: lastMonth } }),
      Lesson.countDocuments({ createdAt: { $gte: lastMonth } }),
      MentorApplication.countDocuments({ 
        status: 'approved',
        createdAt: { $gte: lastMonth }
      })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, recent: number) => {
      if (current === 0) return 0;
      const previous = current - recent;
      if (previous === 0) return recent > 0 ? 100 : 0;
      return Math.round(((recent / previous) * 100) * 10) / 10;
    };

    return {
      totalUsers: { 
        value: totalUsers, 
        growth: calculateGrowth(totalUsers, recentUsers) 
      },
      totalCourses: { 
        value: totalCourses, 
        growth: calculateGrowth(totalCourses, publishedCourses) 
      },
      totalLessons: { 
        value: totalLessons, 
        growth: calculateGrowth(totalLessons, completedLessons) 
      },
      pendingApplications: { 
        value: pendingApplications, 
        growth: calculateGrowth(pendingApplications, approvedApplications) 
      }
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    // Return null values to indicate data unavailable
    return {
      totalUsers: { value: null, growth: null },
      totalCourses: { value: null, growth: null },
      totalLessons: { value: null, growth: null },
      pendingApplications: { value: null, growth: null }
    };
  }
}

const AdminDashboard = async () => {
  // This will redirect to sign-in if not authenticated
  await requireAdminAuth();
  
  // Fetch real statistics from the database
  const statsData = await fetchAdminStats();
  
  // Format stats for display
  const stats = [
    { 
      title: 'Total Users', 
      value: statsData.totalUsers.value !== null ? statsData.totalUsers.value.toLocaleString() : '--',
      growth: statsData.totalUsers.growth,
      icon: <Users />, 
      color: 'text-blue-500' 
    },
    { 
      title: 'Total Courses', 
      value: statsData.totalCourses.value !== null ? statsData.totalCourses.value.toLocaleString() : '--',
      growth: statsData.totalCourses.growth,
      icon: <BookOpen />, 
      color: 'text-green-500' 
    },
    { 
      title: 'Lessons Created', 
      value: statsData.totalLessons.value !== null ? statsData.totalLessons.value.toLocaleString() : '--',
      growth: statsData.totalLessons.growth,
      icon: <GraduationCap />, 
      color: 'text-purple-500' 
    },
    { 
      title: 'Pending Applications', 
      value: statsData.pendingApplications.value !== null ? statsData.pendingApplications.value.toLocaleString() : '--',
      growth: statsData.pendingApplications.growth,
      icon: <ShieldCheck />, 
      color: 'text-yellow-500' 
    },
  ];

  const quickLinks = [
    { title: 'Manage Courses', href: '/admin/courses', icon: <BookOpen /> },
    { title: 'Manage Users', href: '/admin/users', icon: <Users /> },
    { title: 'View Analytics', href: '/admin/analytics', icon: <BarChart3 /> },
    { title: 'Mentor Applications', href: '/admin/mentor-applications', icon: <ShieldCheck /> },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium leading-tight">{stat.title}</CardTitle>
              <div className={`${stat.color} flex-shrink-0`}>{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
              {stat.growth !== null && (
                <p className="text-xs text-muted-foreground flex items-center">
                  <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                  +{stat.growth}% from last month
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Quick Links</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {quickLinks.map((link, index) => (
              <Link 
                key={index} 
                href={link.href} 
                className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
              >
                <span className="flex-shrink-0">{link.icon}</span>
                <span className="font-medium text-sm md:text-base">{link.title}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No recent activity to display</p>
              <p className="text-xs text-muted-foreground mt-1">Activity will appear here when users interact with the platform</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
