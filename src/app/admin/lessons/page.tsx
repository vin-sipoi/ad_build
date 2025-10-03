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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Clock, 
  FileText,
  Play,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import { getLessons, getAllTopics } from './actions';
import { LessonActionsDropdown } from './LessonActionsDropdown';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ILesson } from '../types';

// Force dynamic rendering for admin pages that use cookies
export const dynamic = 'force-dynamic';

type LessonsPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    topicId?: string;
    type?: string;
  }>;
};

const LessonsPage = async ({ searchParams }: LessonsPageProps) => {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || '';
  const topicId = params.topicId || '';
  const type = params.type || '';

  const [lessonResult, topics] = await Promise.all([
    getLessons({ page, search, topicId, type }),
    getAllTopics()
  ]);

  if (!lessonResult.success) {
    return <div>Error: {'error' in lessonResult ? String(lessonResult.error) : 'Unknown error'}</div>;
  }
  if (!topics || topics.length === 0) {
    return <div>Error: No topics found</div>;
  }

  const { data: lessons, pagination } = lessonResult;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'quiz':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20';
      default:
        return 'bg-green-500/10 text-green-700 border-green-500/20';
    }
  };

  const totalMinutes = lessons.reduce((acc: number, lesson: ILesson) => acc + (lesson.estimatedMinutes || 0), 0);
  const publishedLessons = lessons.filter((l: ILesson) => (l as ILesson & { status: 'draft' | 'published' }).status === 'published').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
              <BookOpen className="h-6 w-6 text-violet-500" />
            </div>
            Lessons
          </h2>
          <p className="text-muted-foreground">
            Create and manage individual lesson content
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/admin/lessons/new">
            <Plus className="h-4 w-4" />
            Create Lesson
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all topics
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedLessons}</div>
            <p className="text-xs text-muted-foreground">
              Live for students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m
            </div>
            <p className="text-xs text-muted-foreground">
              Combined lesson time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>Search and filter lessons</CardDescription>
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
            <Select name="topicId" defaultValue={topicId || "all"}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map((topic) => (
                  <SelectItem key={topic._id} value={topic._id.toString()}>
                    {topic.courseId.title} - {topic.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="type" defaultValue={type || "all"}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lessons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Lessons ({pagination?.total || 0})</CardTitle>
          <CardDescription>
            Manage your lesson content and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lessons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No lessons found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {search || topicId || type
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first lesson.'}
              </p>
              {!search && !topicId && !type && (
                <Button asChild>
                  <Link href="/admin/lessons/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Lesson
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Order</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.map((lesson: ILesson) => (
                      <TableRow key={lesson._id}>
                        <TableCell className="font-medium">{lesson.order}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500">
                              <FileText className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium">{lesson.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getTypeColor(lesson.type)} flex items-center gap-1 w-fit`}>
                            {getTypeIcon(lesson.type)}
                            <span className="capitalize">{lesson.type}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {typeof lesson.topicId === 'object' ? lesson.topicId.title : 'Unknown Topic'}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {typeof lesson.topicId === 'object' && typeof lesson.topicId.courseId === 'object' 
                                ? lesson.topicId.courseId.title 
                                : 'Unknown Course'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {lesson.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {lesson.estimatedMinutes || 0} min
                          </div>
                        </TableCell>
                        <TableCell>
                          {(lesson as ILesson & { status: 'draft' | 'published' }).status === 'published' ? (
                            <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20">
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <LessonActionsDropdown lessonId={lesson._id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination?.total || 0)} of {pagination?.total || 0} lessons
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              asChild={page > 1}
            >
              <Link href={`/admin/lessons?page=${page - 1}&search=${search}&topicId=${topicId}&type=${type}`}>
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
                      <Link href={`/admin/lessons?page=${p}&search=${search}&topicId=${topicId}&type=${type}`}>
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
              <Link href={`/admin/lessons?page=${page + 1}&search=${search}&topicId=${topicId}&type=${type}`}>
                Next
              </Link>
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default LessonsPage;
