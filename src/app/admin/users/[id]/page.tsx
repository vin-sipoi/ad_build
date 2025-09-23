import React from 'react';
import { getUserById, getUserCreditHistory } from '../actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { ArrowLeft, CreditCard, Edit, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type UserDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const UserDetailsPage = async ({ params }: UserDetailsPageProps) => {
  const { id } = await params;
  
  const [userResult, creditHistoryResult] = await Promise.all([
    getUserById(id),
    getUserCreditHistory(id)
  ]);

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
  const creditHistory = creditHistoryResult.success ? creditHistoryResult.data : [];

  const totalCreditsEarned = creditHistory
    .filter((t: { amount: number }) => t.amount > 0)
    .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
  
  const totalCreditsSpent = creditHistory
    .filter((t: { amount: number }) => t.amount < 0)
    .reduce((sum: number, t: { amount: number }) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/users/${user._id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
          </Link>
          <Link href={`/admin/users/${user._id}/credits`}>
            <Button>
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Credits
            </Button>
          </Link>
        </div>
      </div>

      {/* User Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {user.profile?.credits || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credits Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{totalCreditsEarned}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credits Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{totalCreditsSpent}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {creditHistory.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="font-medium">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p>{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Roles</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {user.roles.map((role: string) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Member Since</label>
              <p className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Bio</label>
              <p className="text-sm text-gray-800">
                {user.profile?.bio || 'No bio provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Avatar</label>
              <p className="text-sm">
                {user.profile?.avatarUrl ? (
                  <Image 
                    src={user.profile.avatarUrl} 
                    alt="Avatar" 
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  'No avatar uploaded'
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Transaction History</CardTitle>
          <CardDescription>
            Recent credit transactions for this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {creditHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {creditHistory.slice(0, 20).map((transaction: { 
                  _id: string; 
                  createdAt: string; 
                  source: string; 
                  amount: number;
                  note?: string;
                  createdBy?: { name: string };
                }) => (
                  <TableRow key={transaction._id}>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {transaction.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.note || '-'}
                    </TableCell>
                    <TableCell>
                      {transaction.createdBy?.name || 'System'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No credit transactions found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDetailsPage;
