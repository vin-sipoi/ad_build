import React from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { NewUserForm } from '.';

const NewUserPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Create New User
          </h1>
          <p className="text-gray-600">Add a new user to the system</p>
        </div>
      </div>

      {/* New User Form */}
      <NewUserForm />
    </div>
  );
};

export default NewUserPage;
