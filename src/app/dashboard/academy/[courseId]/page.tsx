// Dynamic page for a single course
'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlayCircle } from 'lucide-react';

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.courseId}`);
        if (!response.ok) {
          notFound();
        }
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error('Error fetching course:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.courseId]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-64 bg-card animate-pulse rounded-lg" />
        <div className="h-12 bg-card animate-pulse rounded-lg" />
        <div className="h-48 bg-card animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!course) {
    return notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Course Header */}
      <div className="relative h-64 rounded-lg overflow-hidden mb-8">
        <Image
          src={course.thumbnail || '/course-placeholder.svg'}
          alt={course.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
              Residency Module
            </span>
            <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
              +{course.creditsReward} Credits
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white">{course.title}</h1>
          <p className="text-lg text-white/80">{course.description}</p>
        </div>
      </div>

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Course Modules</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {course.modules.map((module) => (
                  <AccordionItem key={module.id} value={`item-${module.id}`}>
                    <AccordionTrigger className="font-semibold">
                      {module.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                            <div className="flex items-center gap-3">
                              <PlayCircle className="h-5 w-5 text-muted-foreground" />
                              <span>{lesson.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {lesson.duration}m
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {course.creditsRequired > 0 ? (
            <div className="space-y-2">
              <Button className="w-full text-lg py-6" disabled>
                Requires {course.creditsRequired} Credits
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Complete previous modules to unlock
              </p>
            </div>
          ) : (
            <Button className="w-full text-lg py-6">Start Learning</Button>
          )}
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Module Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Modules:</span>
                <span className="font-semibold">{course.modules.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-semibold">{course.estimatedHours}h</span>
              </div>
              <div className="flex justify-between">
                <span>Credits Reward:</span>
                <span className="font-semibold text-primary">+{course.creditsReward}</span>
              </div>
              <div className="flex justify-between">
                <span>Level:</span>
                <span className="font-semibold capitalize">{course.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span>Prerequisites:</span>
                <span className="font-semibold">
                  {course.creditsRequired > 0 ? `${course.creditsRequired} credits` : 'None'}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">What You&apos;ll Learn</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-1 list-disc list-inside">
                <li>Core entrepreneurial concepts</li>
                <li>Practical frameworks and tools</li>
                <li>Real-world case studies</li>
                <li>Interactive exercises</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
