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

// Removed inline DeleteCourseButton - now using CourseActionsDropdown

type CoursesPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    track?: string;
  }>;
};

const CoursesPage = async ({ searchParams }: CoursesPageProps) => {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link href="/admin/courses/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <form className="flex items-center space-x-4">
            <Input
            placeholder="Search by title..."
            name="search"
            defaultValue={search}
            className="max-w-sm"
            />
            {/* Add track filter dropdown here */}
            <Button type="submit">Search</Button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Track</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course: ICourse) => (
              <TableRow key={course._id}>
                <TableCell className="font-medium">{course.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{course.track}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={course.status === 'published' ? 'default' : 'destructive'}
                    className={course.status === 'published' ? 'bg-green-500' : ''}
                  >
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>{(course as { topicCount?: number }).topicCount || 0}</TableCell>
                <TableCell>{typeof course.createdBy === 'object' && course.createdBy ? course.createdBy.name : 'N/A'}</TableCell>
                <TableCell>
                  <CourseActionsDropdown courseId={course._id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
