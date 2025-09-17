'use client';

import { CourseList } from '@/components/academy/CourseList';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

import { JourneyProgress } from '@/components/dashboard';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">Adamur Academy</h1>
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules, tools, or resources"
            className="pl-10 bg-card border-border"
          />
        </div>
      </div>
      
      <JourneyProgress />
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Learning Path</h2>
        <CourseList />
      </div>
    </div>
  );
}
