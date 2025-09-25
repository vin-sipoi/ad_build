'use client';

import { CourseList } from '@/components/academy/CourseList';
import { DashboardOverview } from '@/components/dashboard';

export default function Dashboard() {
  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-4xl font-bold leading-tight">Adamur Academy</h1>
      </div>
      
      <DashboardOverview />
      
      <div>
        <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Available Courses</h2>
        <CourseList />
      </div>
    </div>
  );
}
