import { LessonForm } from "../LessonForm";
import { getAllTopics } from "../actions";

const NewLessonPage = async () => {
  const topicResult = await getAllTopics();

  if (!topicResult.success) {
    return <div>Error: {'error' in topicResult ? String(topicResult.error) : 'Unknown error'}</div>;
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
