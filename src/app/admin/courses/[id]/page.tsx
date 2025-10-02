import { CourseForm } from "../CourseForm";
import { getCourseById } from "../actions";

export const dynamic = 'force-dynamic';

type EditCoursePageProps = {
  params: Promise<{
    id: string;
  }>;
};

const EditCoursePage = async ({ params }: EditCoursePageProps) => {
  const { id } = await params;
  const result = await getCourseById(id);

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Course</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <CourseForm course={result.data} />
      </div>
    </div>
  );
};

export default EditCoursePage;
