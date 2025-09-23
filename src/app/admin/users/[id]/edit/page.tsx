import React from 'react';
import { getUserById } from '../../actions';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserEditForm } from '.';

type UserEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const UserEditPage = async ({ params }: UserEditPageProps) => {
  const { id } = await params;
  
  const userResult = await getUserById(id);

  if (!userResult.success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
        <div className="text-center py-8 text-red-500">
          Error: {userResult.error}
        </div>
      </div>
    );
  }

  const user = userResult.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/admin/users/${user._id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to User Details
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit User</h1>
          <p className="text-gray-600">{user.name} - {user.email}</p>
        </div>
      </div>

      {/* Edit Form */}
      <UserEditForm user={user} />
    </div>
  );
};

export default UserEditPage;
