import { LessonForm } from "../LessonForm";
import { getAllTopics } from "../actions";
import Link from "next/link";

const NewLessonPage = async () => {
  const topics = await getAllTopics();

  if (!topics || topics.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Create New Lesson</h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">No topics found</p>
            <p className="text-sm text-muted-foreground">Please make sure you have created topics first.</p>
            <div className="mt-4 space-x-4">
              <Link href="/admin/topics" className="text-blue-600 hover:underline">
                Go to Topics page to create topics
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/admin/courses" className="text-blue-600 hover:underline">
                Go to Courses page
              </Link>
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
        <LessonForm topics={topics} />
      </div>
    </div>
  );
};

export default NewLessonPage;
