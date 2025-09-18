'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Course, Topic, Module } from '@/types/academy';
import { ArrowLeft, Clock, CheckCircle, Lock, BookOpen } from 'lucide-react';

export default function TopicContentPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseAndTopic = async () => {
      try {
        const response = await fetch(`/api/courses/${params.courseId}`);
        if (response.ok) {
          const courseData = await response.json();
          setCourse(courseData);
          
          // Find the specific topic
          const foundTopic: Topic | undefined = (courseData.modules as Module[])
            .flatMap((module) => module.topics)
            .find((t) => t.id === params.topicId);
          
          setTopic(foundTopic || null);
        }
      } catch (error) {
        console.error('Error fetching course and topic:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.courseId && params.topicId) {
      fetchCourseAndTopic();
    }
  }, [params.courseId, params.topicId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course || !topic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Topic not found</h1>
        <button
          onClick={() => router.push('/dashboard/academy')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Academy
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push(`/dashboard/academy/${params.courseId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {course.title}
            </button>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{topic.title}</h1>
              <p className="text-gray-600 mb-4">{topic.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{topic.estimatedTime} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  {topic.isCompleted ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : topic.isLocked ? (
                    <Lock className="h-4 w-4 text-gray-400" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  )}
                  <span>
                    {topic.isCompleted ? 'Completed' : topic.isLocked ? 'Locked' : 'Ready to learn'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Content</h2>
          
          {/* Prerequisites */}
          {topic.prerequisites && topic.prerequisites.length > 0 && (
            <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-800 mb-3">Prerequisites</h3>
              <ul className="text-sm text-amber-700 space-y-2">
                {topic.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Content Area */}
          <div className="prose max-w-none">
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Coming Soon</h3>
              <p className="text-gray-600">
                This topic content is being prepared. You&apos;ll find interactive lessons, 
                videos, and exercises here once it&apos;s ready.
              </p>
            </div>
          </div>

          {/* Subtopics */}
          {topic.subtopics && topic.subtopics.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What You&apos;ll Learn</h3>
              <div className="space-y-3">
                {topic.subtopics.map((subtopic) => (
                  <div key={subtopic.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-1 rounded-full mt-1 ${
                      subtopic.isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {subtopic.isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-current opacity-60" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{subtopic.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{subtopic.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => router.push(`/dashboard/academy/${params.courseId}`)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Course
          </button>
          
          <div className="flex gap-3">
            <button
              disabled={topic.isLocked}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                topic.isLocked
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {topic.isCompleted ? 'Mark as Complete' : 'Start Learning'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
