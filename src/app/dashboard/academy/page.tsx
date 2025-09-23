'use client';

import { CourseList } from '@/components/academy/CourseList';

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      <div className="container mx-auto px-3 md:px-4 py-6 md:py-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight">Academy</h1>
          <p className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed px-2 md:px-0">
            Master blockchain technology and decentralized finance through our comprehensive learning paths.
            Start your journey today and earn credits as you progress.
          </p>
        </div>

        <CourseList />
      </div>
    </div>
  );
}
