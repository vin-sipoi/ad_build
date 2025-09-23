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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Play, FileText, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { getLessons, getAllTopics } from './actions';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ITopic, ILesson } from '../types';

type LessonsPageProps = {
  searchParams: {
    page?: string;
    search?: string;
    topicId?: string;
    type?: string;
  };
};

const LessonsPage = async ({ searchParams }: LessonsPageProps) => {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page) : 1;
  const search = params.search || '';
  const topicId = params.topicId || '';
  const type = params.type || '';

  const [lessonResult, topicResult] = await Promise.all([
    getLessons({ page, search, topicId, type }),
    getAllTopics()
  ]);

  if (!lessonResult.success) {
    return <div>Error: {'error' in lessonResult ? String(lessonResult.error) : 'Unknown error'}</div>;
  }
  if (!topicResult.success) {
    return <div>Error: {'error' in topicResult ? String(topicResult.error) : 'Unknown error'}</div>;
  }

  const { data: lessons, pagination } = lessonResult;
  const { data: topics } = topicResult;

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
        return 'bg-blue-500';
      case 'quiz':
        return 'bg-purple-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lessons</h1>
        <Link href="/admin/lessons/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Lesson
          </Button>
        </Link>
      </div>

      <form className="flex items-center space-x-4">
        <Input
          placeholder="Search by title..."
          name="search"
          defaultValue={search}
          className="max-w-sm"
        />
        <Select name="topicId" defaultValue={topicId || "all"}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by topic" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map((topic: ITopic & { courseId: { title: string } }) => (
                    <SelectItem key={topic._id} value={topic._id.toString()}>
                        {topic.courseId.title} - {topic.title}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        <Select name="type" defaultValue={type}>
            <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
            </SelectContent>
        </Select>
        <Button type="submit">Search</Button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson: ILesson) => (
              <TableRow key={lesson._id}>
                <TableCell>{lesson.order}</TableCell>
                <TableCell className="font-medium">{lesson.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-white ${getTypeColor(lesson.type)}`}>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(lesson.type)}
                      <span className="capitalize">{lesson.type}</span>
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium">
                      {typeof lesson.topicId === 'object' ? lesson.topicId.title : 'Unknown Topic'}
                    </div>
                    <div className="text-gray-500">
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
                <TableCell>{lesson.estimatedMinutes} min</TableCell>
                <TableCell>
                  <Badge
                    variant={lesson.isActive ? 'default' : 'destructive'}
                    className={lesson.isActive ? 'bg-green-500' : ''}
                  >
                    {lesson.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/lessons/${lesson._id}`}>Edit</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Preview</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              <PaginationPrevious href={page > 1 ? `/admin/lessons?page=${page - 1}&search=${search}&topicId=${topicId}&type=${type}` : '#'} />
            </PaginationItem>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href={`/admin/lessons?page=${i + 1}&search=${search}&topicId=${topicId}&type=${type}`} isActive={page === i + 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={page < pagination.totalPages ? `/admin/lessons?page=${page + 1}&search=${search}&topicId=${topicId}&type=${type}` : '#'} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

    </div>
  );
};

export default LessonsPage;
