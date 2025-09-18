// Academy course card component - Navigates to course detail page
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, BookOpen } from 'lucide-react';
import { Course } from '@/types/academy';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const totalTopics = course.modules.reduce((acc, module) => acc + module.topics.length, 0);

  return (
    <Link href={`/dashboard/academy/${course.id || course._id}`}>
      <Card 
        className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card border-border overflow-hidden"
      >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={course.thumbnail || '/course-placeholder.svg'}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs bg-black/50 text-white border-none">
              {course.difficulty}
            </Badge>
          </div>
          
          {/* Credits */}
          <div className="absolute top-3 right-3">
            <Badge className="text-xs bg-primary/90 text-primary-foreground border-none">
              +{course.creditsReward ?? course.creditReward} credits
            </Badge>
          </div>
          
          {/* Instructor */}
          <div className="absolute bottom-3 left-3 text-white">
            <p className="text-xs opacity-90 mb-1">by {course.createdBy}</p>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {course.description}
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{course.estimatedHours}h</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{totalTopics} topics</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
