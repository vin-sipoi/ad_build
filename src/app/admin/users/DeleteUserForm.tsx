'use client';

import { Trash2 } from 'lucide-react';
import { deleteUser } from './actions';
import { useRouter } from 'next/navigation';

function DeleteUserForm({ userId }: { userId: string }) {
  const router = useRouter();

  return (
    <form 
      action={async () => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone and will remove all their data including credit history.')) {
          const result = await deleteUser(userId);
          if (result.success) {
            router.refresh();
          } else {
            alert('Failed to delete user: ' + (result.error || 'Unknown error'));
          }
        }
      }}
    >
      <button 
        type="submit"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-red-50 h-8 w-8 p-0 text-red-500 hover:text-red-700"
        title="Delete User"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </form>
  );
}

export { DeleteUserForm };
