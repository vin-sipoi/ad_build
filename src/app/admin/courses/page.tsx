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
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { ICourse } from '../types';
import { getCourses } from './actions';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { CourseActionsDropdown } from './CourseActionsDropdown';
import { requireAdminAuth } from '@/lib/admin-auth';

// Removed inline DeleteCourseButton - now using CourseActionsDropdown

type CoursesPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    track?: string;
  }>;
};

const CoursesPage = async ({ searchParams }: CoursesPageProps) => {
  // Require admin authentication
  await requireAdminAuth();
  
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || '';
  const track = params.track || '';

  const result = await getCourses({ page, search, track });

  if (!result.success) {
    return <div>Error: {'error' in result ? String(result.error) : 'Unknown error'}</div>;
  }

  const { data: courses, pagination } = result;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Courses</h1>
        <Link href="/admin/courses/new">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <form className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full">
            <Input
            placeholder="Search by title..."
            name="search"
            defaultValue={search}
            className="w-full sm:max-w-sm"
            />
            {/* Add track filter dropdown here */}
            <Button type="submit" className="w-full sm:w-auto">Search</Button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Title</TableHead>
                <TableHead className="whitespace-nowrap">Track</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Topics</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">Created By</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course: ICourse) => (
                <TableRow key={course._id}>
                  <TableCell className="font-medium">
                    <div className="max-w-[200px] truncate">{course.title}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{course.track}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={course.status === 'published' ? 'default' : 'destructive'}
                      className={`text-xs ${course.status === 'published' ? 'bg-green-500' : ''}`}
                    >
                      {course.status === 'published' ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{(course as { topicCount?: number }).topicCount || 0}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="max-w-[150px] truncate">
                      {typeof course.createdBy === 'object' && course.createdBy ? course.createdBy.name : 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <CourseActionsDropdown courseId={course._id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {pagination && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href={page > 1 ? `/admin/courses?page=${page - 1}&search=${search}&track=${track}` : '#'} />
            </PaginationItem>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href={`/admin/courses?page=${i + 1}&search=${search}&track=${track}`} isActive={page === i + 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={page < pagination.totalPages ? `/admin/courses?page=${page + 1}&search=${search}&track=${track}` : '#'} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

    </div>
  );
};

export default CoursesPage;
