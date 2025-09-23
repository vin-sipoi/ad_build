'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, Topic } from '@/types/academy';
import { TopicRoadmap } from '@/components/academy/TopicRoadmap';
import { TopicContentModal } from '@/components/academy/TopicContentModal';


export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.courseId}`);
        if (response.ok) {
          const courseData = await response.json();
          setCourse(courseData);
        } else {
          console.error('Failed to load course');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.courseId) {
      fetchCourse();
    }
  }, [params.courseId]);

  const handleTopicClick = (topicId: string) => {
    const allTopics = course?.modules.flatMap(module => module.topics) || [];
    const topic = allTopics.find(t => t.id === topicId);
    if (topic) {
      setSelectedTopic(topic);
    }
  };

  const handleTopicChange = (topicId: string) => {
    const allTopics = course?.modules.flatMap(module => module.topics) || [];
    const topic = allTopics.find(t => t.id === topicId);
    if (topic) {
      setSelectedTopic(topic);
    }
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

  const allTopics = course.modules.flatMap(module => module.topics);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Learning Path */}
      <div className="relative">
        <TopicRoadmap 
          course={course} 
          onTopicClick={handleTopicClick}
        />
      </div>

      {/* Topic Content Modal */}
      {selectedTopic && (
        <TopicContentModal
          isOpen={true}
          onClose={() => setSelectedTopic(null)}
          topic={selectedTopic}
          allTopics={allTopics}
          onTopicChange={handleTopicChange}
        />
      )}
    </div>
  );
}
