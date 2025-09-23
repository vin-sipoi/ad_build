import { Pencil, CreditCard, Eye } from 'lucide-react';
import Link from 'next/link';
import { DeleteUserForm } from '.';

function UserActionsDropdown({ userId }: { userId: string }) {
  return (
    <div className="flex gap-2">
      <Link href={`/admin/users/${userId}`}>
        <button 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </button>
      </Link>
      <Link href={`/admin/users/${userId}/edit`}>
        <button 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
          title="Edit User"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </Link>
      <Link href={`/admin/users/${userId}/credits`}>
        <button 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-blue-50 text-blue-600 hover:text-blue-700 h-8 w-8 p-0"
          title="Manage Credits"
        >
          <CreditCard className="h-4 w-4" />
        </button>
      </Link>
      <DeleteUserForm userId={userId} />
    </div>
  );
}

export { UserActionsDropdown };
