// Academy course card component
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types';
import Image from 'next/image';
import { Users } from 'lucide-react';

import Link from 'next/link';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/dashboard/academy/${course._id}`}>
      <Card className="bg-card border-none rounded-lg overflow-hidden group cursor-pointer">
        <div className="relative h-40">
          <Image
            src={course.thumbnail || '/course-placeholder.svg'}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/50 text-white">
              Adamur Academy
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-base line-clamp-2 text-foreground">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Adamur</span>
            </div>
            <span>
              {course.modules.length} Lessons &middot; {course.estimatedHours} hrs
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
