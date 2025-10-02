import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  BookOpen,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';

// Force dynamic rendering for admin pages that use cookies
export const dynamic = 'force-dynamic';
import { requireAdminAuth } from '@/lib/admin-auth';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Lesson } from '@/models/Lesson';
import { Topic } from '@/models/Topic';
import { Progress } from '@/models/Progress';
import { MentorApplication } from '@/models/MentorApplication';

// Type definitions for analytics data
interface UserData {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface ProgressData {
  _id: string;
  userId?: {
    name: string;
  };
  courseId?: {
    title: string;
  };
  updatedAt: Date;
  status: string;
}

interface MentorData {
  _id: string;
  name: string;
  updatedAt: Date;
}

interface CourseStatsData {
  _id: string;
  title?: string;
  name?: string;
  enrollments: number;
  completionRate: number;
}



async function fetchAnalyticsData() {
  try {
    // Ensure database connection is established
    await dbConnect();
    // Calculate date ranges
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

    // Get analytics data in parallel
    const [
      totalUsers,
      totalCourses,
      totalLessons,
      totalTopics,
      newUsersThisMonth,
      activeUsersLast30Days,
      courseCompletions,
      totalProgress,
      topCourseStats,
      recentActivityData
    ] = await Promise.all([
      User.countDocuments({}),
      Course.countDocuments({}),
      Lesson.countDocuments({}),
      Topic.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: lastMonth } }),
      User.countDocuments({ 
        $or: [
          { lastLoginAt: { $gte: last30Days } },
          { createdAt: { $gte: last30Days } }
        ]
      }),
      Progress.countDocuments({ status: 'completed' }),
      Progress.countDocuments({}),
      Course.aggregate([
        {
          $lookup: {
            from: 'progresses',
            localField: '_id',
            foreignField: 'courseId',
            as: 'progress'
          }
        },
        {
          $addFields: {
            enrollments: { $size: '$progress' },
            completions: {
              $size: {
                $filter: {
                  input: '$progress',
                  cond: { $eq: ['$$this.status', 'completed'] }
                }
              }
            }
          }
        },
        {
          $addFields: {
            completionRate: {
              $cond: {
                if: { $gt: ['$enrollments', 0] },
                then: { $multiply: [{ $divide: ['$completions', '$enrollments'] }, 100] },
                else: 0
              }
            }
          }
        },
        { $sort: { enrollments: -1 } },
        { $limit: 5 }
      ]),
      Promise.all([
        User.find({}).sort({ createdAt: -1 }).limit(2).select('name email createdAt'),
        Progress.find({ status: 'completed' }).sort({ updatedAt: -1 }).limit(2)
          .populate('courseId', 'title')
          .populate('userId', 'name'),
        MentorApplication.find({ status: 'approved' }).sort({ updatedAt: -1 }).limit(1)
          .select('name updatedAt')
      ])
    ]);

    // Calculate average completion rate
    const averageCompletionRate = totalProgress > 0 
      ? Math.round((courseCompletions / totalProgress) * 100 * 10) / 10
      : 0;

    return {
      stats: {
        totalUsers,
        totalCourses,
        totalLessons,
        totalTopics,
        activeUsers: activeUsersLast30Days,
        newUsersThisMonth,
        courseCompletions,
        averageCompletionRate
      },
      topCourses: topCourseStats,
      recentActivity: recentActivityData
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      stats: {
        totalUsers: null,
        totalCourses: null,
        totalLessons: null,
        totalTopics: null,
        activeUsers: null,
        newUsersThisMonth: null,
        courseCompletions: null,
        averageCompletionRate: null
      },
      topCourses: [],
      recentActivity: [[], [], []]
    };
  }
}

const AnalyticsPage = async () => {
  // Require admin authentication
  await requireAdminAuth();
  
  // Fetch real analytics data
  const { stats, topCourses, recentActivity } = await fetchAnalyticsData();
  const [newUsers, completedCourses, approvedMentors] = recentActivity;

  // Format recent activity for display
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const formattedRecentActivity = [
    ...(newUsers as UserData[]).map((user, index: number) => ({
      id: `user-${index}`,
      action: 'New user registered',
      user: user.name || user.email,
      time: formatTimeAgo(new Date(user.createdAt))
    })),
    ...(completedCourses as ProgressData[]).map((progress, index: number) => ({
      id: `course-${index}`,
      action: 'Course completed',
      user: progress.userId?.name || 'Unknown User',
      course: progress.courseId?.title || 'Unknown Course',
      time: formatTimeAgo(new Date(progress.updatedAt))
    })),
    ...(approvedMentors as MentorData[]).map((mentor, index: number) => ({
      id: `mentor-${index}`,
      action: 'Mentor application approved',
      user: mentor.name,
      time: formatTimeAgo(new Date(mentor.updatedAt))
    }))
  ].slice(0, 5); // Show only the 5 most recent

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers !== null ? stats.totalUsers.toLocaleString() : '--'}</div>
            {stats.newUsersThisMonth !== null && (
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{stats.newUsersThisMonth} this month
                </span>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers !== null ? stats.activeUsers.toLocaleString() : '--'}</div>
            {stats.activeUsers !== null && stats.totalUsers !== null && stats.totalUsers > 0 && (
              <p className="text-xs text-muted-foreground">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total users
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses !== null ? stats.totalCourses : '--'}</div>
            {stats.totalLessons !== null && (
              <p className="text-xs text-muted-foreground">
                {stats.totalLessons} total lessons
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCompletionRate !== null ? `${stats.averageCompletionRate}%` : '--'}</div>
            {stats.courseCompletions !== null && (
              <p className="text-xs text-muted-foreground">
                {stats.courseCompletions.toLocaleString()} total completions
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>Monthly user registration trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                    <p>Chart visualization would go here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Completion rates by course category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2" />
                    <p>Chart visualization would go here</p>
                    <p className="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Courses with highest enrollment and completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              {topCourses.length > 0 ? (
                <div className="space-y-4">
                  {topCourses.map((course: CourseStatsData, index: number) => (
                    <div key={course._id || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{course.title || course.name || 'Untitled Course'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {course.enrollments || 0} enrollments
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {Math.round((course.completionRate || 0) * 10) / 10}% completion
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Rank #{index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No course data available</p>
                  <p className="text-xs text-muted-foreground mt-1">Course statistics will appear here when data is available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Learners</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mentors</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Admins</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Daily Active</span>
                    <span className="text-sm font-medium">72%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Weekly Active</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Monthly Active</span>
                    <span className="text-sm font-medium">92%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">7-day retention</span>
                    <span className="text-sm font-medium">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">30-day retention</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">90-day retention</span>
                    <span className="text-sm font-medium">52%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and events on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {formattedRecentActivity.length > 0 ? (
                <div className="space-y-4">
                  {formattedRecentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          by {activity.user}
                          {'course' in activity && ` • ${activity.course}`}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-xs text-muted-foreground">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                  <p className="text-xs text-muted-foreground mt-1">User and platform activity will appear here when available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
