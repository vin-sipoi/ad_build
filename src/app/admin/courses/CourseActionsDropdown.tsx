import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { DeleteCourseForm } from './DeleteCourseForm';

function CourseActionsDropdown({ courseId }: { courseId: string }) {
  return (
    <div className="flex gap-2">
      <Link href={`/admin/courses/${courseId}`}>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
          <Pencil className="h-4 w-4" />
        </button>
      </Link>
      <DeleteCourseForm courseId={courseId} />
    </div>
  );
}

export { CourseActionsDropdown };
