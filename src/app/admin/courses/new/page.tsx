import { CourseForm } from "../CourseForm";

const NewCoursePage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create New Course</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <CourseForm />
      </div>
    </div>
  );
};

export default NewCoursePage;
