'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course } from '@/types/academy';
import { TopicRoadmap } from '@/components/academy/TopicRoadmap';
import { TopicModal } from '@/components/academy/TopicModal';
import { ArrowLeft, BookOpen, Clock, Users } from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses`);
        if (response.ok) {
          const courses: Course[] = await response.json();
          const found = courses.find(c => c.id === params.courseId || c._id === params.courseId);
          setCourse(found || null);
        } else {
          console.error('Failed to load courses list');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.courseId) {
      fetchCourse();
    }
  }, [params.courseId]);

  const handleTopicClick = (topicId: string) => {
    setSelectedTopicId(topicId);
  };

  const handleStartTopic = (topicId: string) => {
    router.push(`/dashboard/academy/${params.courseId}/topics/${topicId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
        <button 
          onClick={() => router.push('/dashboard/academy')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Academy
        </button>
      </div>
    );
  }

  const selectedTopic = course.modules
    .flatMap(module => module.topics)
    .find(topic => topic.id === selectedTopicId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/dashboard/academy')}
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Academy
            </button>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
              <p className="text-gray-300 text-lg mb-4">{course.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{course.estimatedHours ?? course.duration} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.modules.reduce((acc, module) => acc + module.topics.length, 0)} topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="capitalize">{course.difficulty}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Learning Path</h2>
          <p className="text-gray-400">
            Follow the roadmap below to master {course.title.toLowerCase()}. Click on any topic to get started.
          </p>
        </div>

        {/* Topics Roadmap */}
        <TopicRoadmap 
          course={course} 
          onTopicClick={handleTopicClick}
        />
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <TopicModal
          topic={selectedTopic}
          onClose={() => setSelectedTopicId(null)}
          onStart={() => handleStartTopic(selectedTopic.id)}
        />
      )}
    </div>
  );
}
