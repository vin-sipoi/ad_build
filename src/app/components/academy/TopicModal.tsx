'use client';

import { Topic } from '@/types/academy';
import { X, Play, Clock, CheckCircle, Lock } from 'lucide-react';

interface TopicModalProps {
  topic: Topic;
  onClose: () => void;
  onStart: () => void;
}

export function TopicModal({ topic, onClose, onStart }: TopicModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              topic.isCompleted 
                ? 'bg-green-100 text-green-600' 
                : topic.isLocked 
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-blue-100 text-blue-600'
            }`}>
              {topic.isCompleted ? (
                <CheckCircle className="h-5 w-5" />
              ) : topic.isLocked ? (
                <Lock className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{topic.title}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{topic.estimatedTime} min</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Summary</h3>
            <p className="text-gray-600 leading-relaxed">{topic.description}</p>
          </div>

          {/* Subtopics */}
          {topic.subtopics && topic.subtopics.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">What You&apos;ll Learn</h3>
              <ul className="space-y-2">
                {topic.subtopics.map((subtopic) => (
                  <li key={subtopic.id} className="flex items-start gap-3">
                    <div className={`p-1 rounded-full mt-0.5 ${
                      subtopic.isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {subtopic.isCompleted ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <div className="h-3 w-3 rounded-full bg-current opacity-60" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{subtopic.title}</h4>
                      <p className="text-sm text-gray-600">{subtopic.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {topic.prerequisites && topic.prerequisites.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="text-sm font-medium text-amber-800 mb-2">Prerequisites</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                {topic.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {topic.isCompleted ? (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Completed
              </span>
            ) : topic.isLocked ? (
              <span className="flex items-center gap-2 text-gray-500">
                <Lock className="h-4 w-4" />
                Complete prerequisites to unlock
              </span>
            ) : (
              <span>Ready to start</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onStart}
              disabled={topic.isLocked}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                topic.isLocked
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : topic.isCompleted
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {topic.isCompleted ? 'Review' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
