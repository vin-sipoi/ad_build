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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { getMentorApplications } from './actions';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type MentorApplicationsPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
};

const MentorApplicationsPage = async ({ searchParams }: MentorApplicationsPageProps) => {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const status = params.status || '';

  const result = await getMentorApplications({ page, status });

  if (!result.success) {
    return <div>Error: {'error' in result ? String(result.error) : 'Unknown error'}</div>;
  }

  const { data: applications, pagination } = result;
  const safePagination = pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mentor Applications</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select defaultValue={status || "all"}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Expertise</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((application: {
              _id: string;
              userId: { name?: string; email?: string };
              expertiseTracks: string[];
              status: string;
              createdAt: string;
            }) => (
              <TableRow key={application._id}>
                <TableCell className="font-medium">
                  {application.userId?.name || 'Unknown'}
                </TableCell>
                <TableCell>{application.userId?.email || 'Unknown'}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {application.expertiseTracks.map((track: string) => (
                      <Badge key={track} variant="outline">
                        {track}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(application.status)}</TableCell>
                <TableCell>
                  {new Date(application.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      {application.status === 'pending' && (
                        <>
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {safePagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            {safePagination.page > 1 && (
              <PaginationItem>
                <PaginationPrevious href={`?page=${safePagination.page - 1}&status=${status}`} />
              </PaginationItem>
            )}

            {Array.from({ length: safePagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href={`?page=${pageNum}&status=${status}`}
                  isActive={pageNum === safePagination.page}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}

            {safePagination.page < safePagination.totalPages && (
              <PaginationItem>
                <PaginationNext href={`?page=${safePagination.page + 1}&status=${status}`} />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}

      {applications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No mentor applications found
        </div>
      )}
    </div>
  );
};

export default MentorApplicationsPage;
