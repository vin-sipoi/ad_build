'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Clock,
  Trophy,
  CheckCircle,
  PlayCircle,
  Lock,
  GraduationCap,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface UserProgress {
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  totalTopics: number;
  completedTopics: number;
  totalLessons: number;
  completedLessons: number;
  timeSpent: number; // in minutes
  creditsEarned: number;
  lastAccessed: Date;
  progress: number; // percentage
  topics: {
    topicId: string;
    title: string;
    completed: boolean;
    lessonsCompleted: number;
    totalLessons: number;
  }[];
}

interface UserStats {
  totalProgress: number;
  totalCreditsEarned: number;
  totalTimeSpent: number; // in minutes
  coursesStarted: number;
  coursesCompleted: number;
}

export default function MyJourneyPage() {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProgress = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/users/${user.uid}/progress`);
        if (response.ok) {
          const data = await response.json();
          setUserProgress(data.courses || []);
          setUserStats(data.stats || {
            totalProgress: 0,
            totalCreditsEarned: 0,
            totalTimeSpent: 0,
            coursesStarted: 0,
            coursesCompleted: 0
          });
        } else if (response.status === 500) {
          // If there's a server error (likely invalid course IDs), try to clean up
          console.warn('Server error fetching progress. Attempting cleanup...');
          
          // Try to clean up invalid course IDs
          try {
            const token = await user.getIdToken();
            await fetch('/api/user/cleanup-path', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            // Retry fetching progress after cleanup
            const retryResponse = await fetch(`/api/users/${user.uid}/progress`);
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              setUserProgress(data.courses || []);
              setUserStats(data.stats || {
                totalProgress: 0,
                totalCreditsEarned: 0,
                totalTimeSpent: 0,
                coursesStarted: 0,
                coursesCompleted: 0
              });
            }
          } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
          }
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
        // Set empty state if API fails
        setUserProgress([]);
        setUserStats({
          totalProgress: 0,
          totalCreditsEarned: 0,
          totalTimeSpent: 0,
          coursesStarted: 0,
          coursesCompleted: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, [user]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Please sign in to view your journey</h1>
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Learning Journey</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back, {user.displayName || user.email?.split('@')[0]}!
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalProgress.toFixed(1) || 0}%</div>
            <Progress value={userStats?.totalProgress || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {userStats?.coursesCompleted || 0} of {userStats?.coursesStarted || 0} courses completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{userStats?.totalCreditsEarned || 0}</div>
            <p className="text-xs text-muted-foreground">Keep learning to earn more!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(userStats?.totalTimeSpent || 0)}</div>
            <p className="text-xs text-muted-foreground">Total learning time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Started</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.coursesStarted || 0}</div>
            <p className="text-xs text-muted-foreground">Active learning paths</p>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Your Courses</h2>
        
        {userProgress.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No courses started yet</h3>
              <p className="text-muted-foreground mb-4">
                Start your learning journey by exploring our courses
              </p>
              <Link href="/dashboard/residency">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          userProgress.map((course) => (
            <Card key={course.courseId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{course.courseTitle}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(course.timeSpent)}
                      </span>
                      <span className="flex items-center">
                        <Trophy className="h-4 w-4 mr-1" />
                        {course.creditsEarned} credits
                      </span>
                      <span>
                        Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Badge variant={course.progress === 100 ? "default" : "secondary"}>
                    {course.progress.toFixed(0)}% Complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Course Progress</span>
                    <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                {/* Topics Progress */}
                <div className="space-y-3">
                  <h4 className="font-medium">Topics Progress</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {course.topics.map((topic) => (
                      <div
                        key={topic.topicId}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          {topic.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : topic.lessonsCompleted > 0 ? (
                            <PlayCircle className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-sm font-medium">{topic.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {topic.lessonsCompleted}/{topic.totalLessons}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {course.completedTopics}/{course.totalTopics} topics completed
                  </div>
                  <Link href={`/dashboard/academy/${course.courseSlug}`}>
                    <Button size="sm">
                      {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}