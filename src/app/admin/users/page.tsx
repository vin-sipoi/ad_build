import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Search, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { getUsers } from './actions';
import { UserActionsDropdown } from './UserActionsDropdown';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IUser } from '../types';
import { requireAdminAuth } from '@/lib/admin-auth';

type UsersPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
  }>;
};

const UsersPage = async ({ searchParams }: UsersPageProps) => {
  // Require admin authentication
  await requireAdminAuth();
  
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || '';
  const role = params.role || '';

  const result = await getUsers({ page, search, role });

  if (!result.success) {
    return <div>Error: {'error' in result ? String(result.error) : 'Unknown error'}</div>;
  }

  const { data: users, pagination } = result;
  const safePagination = pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Users</h1>
        <Link href="/admin/users/new">
          <Button className="w-full sm:w-auto">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            defaultValue={search}
          />
        </div>
        <Select defaultValue={role || "all"}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="learner">Learner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table - Desktop */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Transactions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user: IUser & { totalTransactions?: number }) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {user.profile?.credits || 0} credits
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {user.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {user.totalTransactions || 0} transactions
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt || '').toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <UserActionsDropdown userId={user._id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {users.map((user: IUser & { totalTransactions?: number }) => (
          <div key={user._id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <UserActionsDropdown userId={user._id} />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="font-mono text-xs">
                {user.profile?.credits || 0} credits
              </Badge>
              <Badge variant="outline" className="text-xs">
                {user.totalTransactions || 0} transactions
              </Badge>
            </div>
            
            <div className="flex gap-1 flex-wrap">
              {user.roles.map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
            
            <p className="text-xs text-muted-foreground">
              Created: {new Date(user.createdAt || '').toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {safePagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {safePagination.page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`?page=${safePagination.page - 1}&search=${search}&role=${role}`} />
              </PaginationItem>
            )}

            {Array.from({ length: safePagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href={`?page=${pageNum}&search=${search}&role=${role}`}
                  isActive={pageNum === safePagination.page}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}

            {safePagination.page < safePagination.totalPages && (
              <PaginationItem>
                <PaginationNext href={`?page=${safePagination.page + 1}&search=${search}&role=${role}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}

      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found
        </div>
      )}
    </div>
  );
};

export default UsersPage;
