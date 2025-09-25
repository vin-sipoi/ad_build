import { LessonForm } from "../LessonForm";
import { getAllTopics } from "../actions";
import Link from "next/link";

const NewLessonPage = async () => {
  const topicResult = await getAllTopics();

  if (!topicResult.success) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Create New Lesson</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load topics: {'error' in topicResult ? String(topicResult.error) : 'Unknown error'}</p>
            <p className="text-sm text-muted-foreground">Please make sure you have created topics first, or check your database connection.</p>
            <div className="mt-4 space-x-4">
              <Link href="/admin/topics" className="text-blue-600 hover:underline">
                Go to Topics page to create topics
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/admin/courses" className="text-blue-600 hover:underline">
                Go to Courses page
              </Link>
            </div>
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm text-left">
              <p className="font-semibold mb-2">Debug info:</p>
              <p>API call working: Topics API returned data</p>
              <p>Server action error: {JSON.stringify(topicResult)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Lesson</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <LessonForm topics={topicResult.data} />
      </div>
    </div>
  );
};

export default NewLessonPage;
