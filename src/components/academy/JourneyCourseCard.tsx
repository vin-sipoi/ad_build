// Journey course card component - shows enrolled courses with progress
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, BookOpen, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface JourneyCourseCardProps {
  course: {
    courseId: string;
    courseTitle: string;
    courseSlug: string;
    totalTopics: number;
    completedTopics: number;
    totalLessons: number;
    completedLessons: number;
    timeSpent: number;
    creditsEarned: number;
    progress: number;
    thumbnail?: string;
    difficulty?: string;
  };
}

export function JourneyCourseCard({ course }: JourneyCourseCardProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Link href={`/dashboard/academy/${course.courseSlug}`}>
      <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative h-40 md:h-48 overflow-hidden">
            <Image
              src={course.thumbnail || '/course-placeholder.svg'}
              alt={course.courseTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Progress Badge */}
            <div className="absolute top-2 md:top-3 left-2 md:left-3">
              <Badge 
                variant="secondary" 
                className={`text-xs border-none px-2 py-1 ${
                  course.progress === 100 
                    ? 'bg-green-500/90 text-white' 
                    : 'bg-blue-500/90 text-white'
                }`}
              >
                {course.progress === 100 ? 'Completed' : `${Math.round(course.progress)}% Complete`}
              </Badge>
            </div>

            {/* Credits Earned */}
            <div className="absolute top-2 md:top-3 right-2 md:right-3">
              <Badge className="text-xs bg-amber-500/90 text-white border-none px-2 py-1">
                <Trophy className="h-3 w-3 mr-1 inline" />
                {course.creditsEarned} credits
              </Badge>
            </div>

            {/* Difficulty Badge (if available) */}
            {course.difficulty && (
              <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3">
                <Badge variant="secondary" className="text-xs bg-black/50 text-white border-none px-2 py-1">
                  {course.difficulty}
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-3 md:p-4">
            <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {course.courseTitle}
            </h3>

            {/* Progress Bar */}
            <div className="mb-3 md:mb-4">
              <Progress value={course.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {course.completedLessons} of {course.totalLessons} lessons completed
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{formatTime(course.timeSpent)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 shrink-0" />
                  <span>{course.completedTopics}/{course.totalTopics} topics</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              size="sm" 
              className="w-full"
              variant={course.progress === 100 ? "outline" : "default"}
            >
              {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
