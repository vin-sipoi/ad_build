'use client';

import { CourseList } from '@/components/academy/CourseList';

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Academy</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Master blockchain technology and decentralized finance through our comprehensive learning paths.
            Start your journey today and earn credits as you progress.
          </p>
        </div>

        <CourseList />
      </div>
    </div>
  );
}
