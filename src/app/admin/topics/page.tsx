import React from 'react';
import { getTopics, getAllCourses } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ICourse, ITopic } from '../types';
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
  LayoutGrid, 
  Plus, 
  Search, 
  BookOpen, 
  FileText 
} from 'lucide-react';
import Link from 'next/link';
import { TopicActionsDropdown } from './TopicActionsDropdown';

// Force dynamic rendering for admin pages that use cookies
export const dynamic = 'force-dynamic';

type TopicsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    courseId?: string;
  }>;
};

const TopicsPage = async ({ searchParams }: TopicsPageProps) => {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || '';
  const courseId = params.courseId || '';

  const [topicResult, courseResult] = await Promise.all([
    getTopics({ page, search, courseId }),
    getAllCourses()
  ]);

  if (!topicResult.success) {
    return <div>Error: {'error' in topicResult ? String(topicResult.error) : 'Unknown error'}</div>;
  }
  if (!courseResult.success) {
    return <div>Error: {'error' in courseResult ? String(courseResult.error) : 'Unknown error'}</div>;
  }

  const { data: topics, pagination } = topicResult;
  const { data: courses } = courseResult;

  const publishedTopics = topics.filter((t: ITopic) => t.status === 'published').length;
  const totalLessons = topics.reduce((acc: number, t: ITopic & { lessonCount?: number }) => acc + ((t as { lessonCount?: number }).lessonCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20">
              <LayoutGrid className="h-6 w-6 text-purple-500" />
            </div>
            Topics
          </h2>
          <p className="text-muted-foreground">
            Organize course content into structured topics
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/topics/new">
            <Plus className="h-4 w-4" />
            Create Topic
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Topics</CardTitle>
            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedTopics}</div>
            <p className="text-xs text-muted-foreground">
              Live for students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
            <p className="text-xs text-muted-foreground">
              Across all topics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Search and filter topics</CardDescription>
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
            <Select name="courseId" defaultValue={courseId || "all"}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course: ICourse) => (
                  <SelectItem key={course._id} value={course._id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Topics ({pagination?.total || 0})</CardTitle>
          <CardDescription>
            Manage your course topics and structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <LayoutGrid className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No topics found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {search || courseId
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first topic.'}
              </p>
              {!search && !courseId && (
                <Button asChild>
                  <Link href="/admin/topics/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Topic
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Lessons</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topics.map((topic: ITopic & { courseId: { title: string } }) => (
                    <TableRow key={topic._id}>
                      <TableCell className="font-medium">{topic.order}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500">
                            <LayoutGrid className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-medium">{topic.title}</div>
                            {topic.summary && (
                              <div className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                {topic.summary}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {topic.courseId.title}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {topic.status === 'published' ? (
                          <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                          {(topic as { lessonCount?: number }).lessonCount || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <TopicActionsDropdown topicId={topic._id} />
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination?.total || 0)} of {pagination?.total || 0} topics
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              asChild={page > 1}
            >
              <Link href={`/admin/topics?page=${page - 1}&search=${search}&courseId=${courseId}`}>
                Previous
              </Link>
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination?.totalPages || 1 }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === (pagination?.totalPages || 1) ||
                    (p >= page - 1 && p <= page + 1)
                )
                .map((p, i, arr) => (
                  <React.Fragment key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={p === page ? 'default' : 'outline'}
                      size="sm"
                      className="w-9"
                      asChild={p !== page}
                    >
                      <Link href={`/admin/topics?page=${p}&search=${search}&courseId=${courseId}`}>
                        {p}
                      </Link>
                    </Button>
                  </React.Fragment>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === (pagination?.totalPages || 1)}
              asChild={page < (pagination?.totalPages || 1)}
            >
              <Link href={`/admin/topics?page=${page + 1}&search=${search}&courseId=${courseId}`}>
                Next
              </Link>
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default TopicsPage;
