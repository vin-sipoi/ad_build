import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Plus, 
  Search, 
  LayoutGrid, 
  TrendingUp 
} from 'lucide-react';
import Link from 'next/link';
import { ICourse } from '../types';
import { getCourses } from './actions';
import { CourseActionsDropdown } from './CourseActionsDropdown';
import { requireAdminAuth } from '@/lib/admin-auth';

// Force dynamic rendering for admin pages that use cookies
export const dynamic = 'force-dynamic';

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

  const publishedCourses = courses.filter((c: ICourse) => c.status === 'published').length;
  const totalTopics = courses.reduce((acc: number, c: ICourse & { topicCount?: number }) => acc + ((c as { topicCount?: number }).topicCount || 0), 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
            </div>
            Courses
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Create and manage your learning courses
          </p>
        </div>
        <Button asChild className="gap-2 w-full sm:w-auto">
          <Link href="/admin/courses/new">
            <Plus className="h-4 w-4" />
            <span className="sm:inline">Create Course</span>
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Available for students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCourses}</div>
            <p className="text-xs text-muted-foreground">
              Live for students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTopics}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Search and filter courses</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by title..."
                defaultValue={search}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">All Courses ({pagination?.total || 0})</CardTitle>
          <CardDescription className="text-sm">
            Manage your course curriculum and content
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="rounded-full bg-muted p-4 mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base md:text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-4 max-w-sm">
                {search
                  ? 'Try adjusting your search terms.'
                  : 'Get started by creating your first course.'}
              </p>
              {!search && (
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/admin/courses/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Course
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Track</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-center hidden md:table-cell">Topics</TableHead>
                    <TableHead className="hidden lg:table-cell">Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course: ICourse) => (
                    <TableRow key={course._id}>
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 flex-shrink-0">
                            <BookOpen className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-sm md:text-base">{course.title}</div>
                            {course.description && (
                              <div className="text-xs md:text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                {course.description}
                              </div>
                            )}
                            {/* Mobile-only: Show status and track */}
                            <div className="flex gap-2 mt-2 sm:hidden">
                              <Badge variant="outline" className="capitalize font-normal text-xs">
                                {course.track?.replace('-', ' ')}
                              </Badge>
                              {course.status === 'published' ? (
                                <Badge className="bg-green-500/10 text-green-700 border-green-500/20 text-xs">
                                  Published
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Draft</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="capitalize font-normal text-xs">
                          {course.track?.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {course.status === 'published' ? (
                          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20 text-xs">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        <div className="inline-flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted text-xs md:text-sm font-medium">
                          {(course as { topicCount?: number }).topicCount || 0}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs md:text-sm text-muted-foreground">
                        {typeof course.createdBy === 'object' && course.createdBy ? course.createdBy.name : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <CourseActionsDropdown courseId={course._id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> courses
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/admin/courses?page=${page - 1}&search=${search}&track=${track}&status=${status}`}>
                  Previous
                </Link>
              ) : (
                'Previous'
              )}
            </Button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {(() => {
                const current = pagination.page;
                const total = pagination.totalPages;
                const pages = [];

                if (total <= 7) {
                  // Show all pages if 7 or fewer
                  for (let i = 1; i <= total; i++) {
                    pages.push(i);
                  }
                } else {
                  // Always show first page
                  pages.push(1);

                  if (current > 3) {
                    pages.push(-1); // Ellipsis
                  }

                  // Show current page and neighbors
                  const start = Math.max(2, current - 1);
                  const end = Math.min(total - 1, current + 1);
                  for (let i = start; i <= end; i++) {
                    pages.push(i);
                  }

                  if (current < total - 2) {
                    pages.push(-2); // Ellipsis
                  }

                  // Always show last page
                  pages.push(total);
                }

                return pages.map((pageNum, idx) =>
                  pageNum === -1 || pageNum === -2 ? (
                    <React.Fragment key={`ellipsis-${idx}`}>
                      <span className="px-2 text-muted-foreground">...</span>
                    </React.Fragment>
                  ) : (
                    <Button
                      key={pageNum}
                      variant={pageNum === current ? 'default' : 'outline'}
                      size="sm"
                      className="w-9"
                      asChild
                    >
                      <Link href={`/admin/courses?page=${pageNum}&search=${search}&track=${track}&status=${status}`}>
                        {pageNum}
                      </Link>
                    </Button>
                  )
                );
              })()}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              asChild={page < pagination.totalPages}
            >
              {page < pagination.totalPages ? (
                <Link href={`/admin/courses?page=${page + 1}&search=${search}&track=${track}&status=${status}`}>
                  Next
                </Link>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CoursesPage;
