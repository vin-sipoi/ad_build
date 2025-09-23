import { TopicForm } from "../TopicForm";
import { getTopicById, getAllCourses } from "../actions";

type EditTopicPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const EditTopicPage = async ({ params }: EditTopicPageProps) => {
  const { id } = await params;
  const [topicResult, courseResult] = await Promise.all([
    getTopicById(id),
    getAllCourses()
  ]);

  if (!topicResult.success) {
    return <div>Error: {'error' in topicResult ? String(topicResult.error) : 'Unknown error'}</div>;
  }
  if (!courseResult.success) {
    return <div>Error: {'error' in courseResult ? String(courseResult.error) : 'Unknown error'}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Topic</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <TopicForm topic={topicResult.data} courses={courseResult.data} />
      </div>
    </div>
  );
};

export default EditTopicPage;
