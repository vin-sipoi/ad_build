'use client';

import { Trash2 } from 'lucide-react';
import { deleteCourse } from './actions';
import { useRouter } from 'next/navigation';

function DeleteCourseForm({ courseId }: { courseId: string }) {
  const router = useRouter();

  return (
    <form 
      action={async () => {
        if (confirm('Are you sure you want to delete this course?')) {
          const result = await deleteCourse(courseId);
          if (result.success) {
            router.refresh();
          } else {
            alert('Failed to delete course');
          }
        }
      }}
    >
      <button 
        type="submit"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-red-50 h-8 w-8 p-0 text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

export { DeleteCourseForm };
