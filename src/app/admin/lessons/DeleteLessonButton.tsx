'use client';

import { useState } from 'react';
import { deleteLesson } from './actions';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface DeleteLessonButtonProps {
  lessonId: string;
}

export function DeleteLessonButton({ lessonId }: DeleteLessonButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteLesson(lessonId);
      if (result.success) {
        alert('Lesson deleted successfully!');
        window.location.reload();
      } else {
        alert('Failed to delete lesson: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error deleting lesson: ' + String(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenuItem
      className="text-red-500"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </DropdownMenuItem>
  );
}
