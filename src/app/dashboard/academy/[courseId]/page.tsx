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

  // Safe access to topics with fallback
  const allTopics = course.modules?.flatMap(module => module?.topics || []) || [];
  
  // If no topics are available, show a coming soon message
  if (allTopics.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="relative">
          <TopicRoadmap 
            course={course} 
            onTopicClick={handleTopicClick}
          />
        </div>
        
        {/* Content Coming Soon Modal */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Content Coming Soon!</h3>
            <p className="text-gray-600 mb-6">
              We&apos;re working hard to bring you amazing learning content for this course. 
              Check back soon for updates!
            </p>
            <button 
              onClick={() => router.push('/dashboard/academy')}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Academy
            </button>
          </div>
        </div>
      </div>
    );
  }

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
