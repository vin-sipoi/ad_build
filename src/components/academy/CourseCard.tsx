// Academy course card component - opens modal for course detail
'use client';

import Image from 'next/image';
import { KeyboardEvent, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, BookOpen } from 'lucide-react';
import { Course } from '@/types/academy';

interface CourseCardProps {
  course: Course;
  onSelect?: (course: Course) => void;
}

export function CourseCard({ course, onSelect }: CourseCardProps) {
  const handleSelect = useCallback(() => {
    onSelect?.(course);
  }, [course, onSelect]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect?.(course);
      }
    },
    [course, onSelect]
  );

  const totalTopics = course.modules.reduce((acc, module) => acc + module.topics.length, 0);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 rounded-lg"
    >
      <Card
        className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card border-border overflow-hidden touch-manipulation"
      >
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative h-40 md:h-48 overflow-hidden">
            <Image
              src={course.thumbnail || '/course-placeholder.svg'}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-2 md:top-3 left-2 md:left-3">
              <Badge variant="secondary" className="text-xs bg-black/50 text-white border-none px-2 py-1">
                {course.difficulty}
              </Badge>
            </div>

            {/* Credits */}
            <div className="absolute top-2 md:top-3 right-2 md:right-3">
              <Badge className="text-xs bg-primary/90 text-primary-foreground border-none px-2 py-1">
                +{course.creditsReward ?? course.creditReward} credits
              </Badge>
            </div>

            {/* Instructor */}
            <div className="absolute bottom-2 md:bottom-3 left-2 md:left-3 text-white">
              <p className="text-xs opacity-90 mb-1">by {course.createdBy}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 md:p-4">
            <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {course.title}
            </h3>

            <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2 leading-relaxed">
              {course.description}
            </p>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{course.estimatedHours}h</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 shrink-0" />
                  <span>{totalTopics} topics</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
