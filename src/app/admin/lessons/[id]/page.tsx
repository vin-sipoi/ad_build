import { LessonForm } from "../LessonForm";
import { getLessonById, getAllTopics } from "../actions";

type EditLessonPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const EditLessonPage = async ({ params }: EditLessonPageProps) => {
  const { id } = await params;
  const [lessonResult, topicResult] = await Promise.all([
    getLessonById(id),
    getAllTopics()
  ]);

  if (!lessonResult.success) {
    return <div>Error: {'error' in lessonResult ? String(lessonResult.error) : 'Unknown error'}</div>;
  }
  if (!topicResult.success) {
    return <div>Error: {'error' in topicResult ? String(topicResult.error) : 'Unknown error'}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Lesson</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <LessonForm lesson={lessonResult.data} topics={topicResult.data} />
      </div>
    </div>
  );
};

export default EditLessonPage;
