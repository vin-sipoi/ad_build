import React from 'react';
import { getTopics, getAllCourses } from './actions';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { TopicActionsDropdown } from './TopicActionsDropdown';

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Topics</h1>
        <Link href="/admin/topics/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Topic
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
        <Select name="courseId" defaultValue={courseId || "all"}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by course" />
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
        <Button type="submit">Search</Button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lessons</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic: ITopic & { courseId: { title: string } }) => (
              <TableRow key={topic._id}>
                <TableCell>{topic.order}</TableCell>
                <TableCell className="font-medium">{topic.title}</TableCell>
                <TableCell>{topic.courseId.title}</TableCell>
                <TableCell>
                  <Badge
                    variant={topic.status === 'published' ? 'default' : 'destructive'}
                    className={topic.status === 'published' ? 'bg-green-500' : ''}
                  >
                    {topic.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>{(topic as { lessonCount?: number }).lessonCount || 0}</TableCell>
                <TableCell>
                  <TopicActionsDropdown topicId={topic._id} />
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
              <PaginationPrevious href={page > 1 ? `/admin/topics?page=${page - 1}&search=${search}&courseId=${courseId}` : '#'} />
            </PaginationItem>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href={`/admin/topics?page=${i + 1}&search=${search}&courseId=${courseId}`} isActive={page === i + 1}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href={page < pagination.totalPages ? `/admin/topics?page=${page + 1}&search=${search}&courseId=${courseId}` : '#'} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

    </div>
  );
};

export default TopicsPage;
