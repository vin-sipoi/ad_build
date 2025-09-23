import { TopicForm } from "../TopicForm";
import { getAllCourses } from "../actions";

const NewTopicPage = async () => {
  const courseResult = await getAllCourses();

  if (!courseResult.success) {
    return <div>Error: {'error' in courseResult ? String(courseResult.error) : 'Unknown error'}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Topic</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <TopicForm courses={courseResult.data} />
      </div>
    </div>
  );
};

export default NewTopicPage;
