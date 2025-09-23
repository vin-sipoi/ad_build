import React from 'react';
import { getUserById } from '../../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { CreditManagementForm } from '.';

type UserCreditsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const UserCreditsPage = async ({ params }: UserCreditsPageProps) => {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/users/${user._id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to User Details
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Manage Credits</h1>
            <p className="text-gray-600">{user.name} - {user.email}</p>
          </div>
        </div>
      </div>

      {/* Current Credits Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Credits
          </CardTitle>
          <CardDescription>
            User&apos;s current credit balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-600">
            {user.profile?.credits || 0} credits
          </div>
        </CardContent>
      </Card>

      {/* Credit Management Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add or Remove Credits</CardTitle>
          <CardDescription>
            Adjust the user&apos;s credit balance. Use positive numbers to add credits and negative numbers to remove credits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreditManagementForm userId={user._id} currentCredits={user.profile?.credits || 0} />
        </CardContent>
      </Card>

      {/* Credit Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-600">Earning Credits</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Course completion: 50-100 credits</li>
                <li>• Lesson completion: 5-10 credits</li>
                <li>• Bonus activities: 10-25 credits</li>
                <li>• Manual admin award: Variable</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-600">Using Credits</h4>
              <ul className="text-sm space-y-1 mt-2">
                <li>• Access premium courses</li>
                <li>• Unlock advanced content</li>
                <li>• Redeem for certificates</li>
                <li>• Special learning resources</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserCreditsPage;
