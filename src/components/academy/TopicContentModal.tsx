'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Play, CheckCircle, Clock } from 'lucide-react';
import { Topic } from '@/types/academy';

interface TopicContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic;
  allTopics: Topic[];
  onTopicChange: (topicId: string) => void;
}

export function TopicContentModal({ 
  isOpen, 
  onClose, 
  topic, 
  allTopics, 
  onTopicChange 
}: TopicContentModalProps) {
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
  
  // Safe access to subtopics - fallback to lessons or empty array
  const subtopics = topic.subtopics || (topic as unknown as { lessons?: unknown[] }).lessons || [];
  const currentSubtopic = subtopics[currentSubtopicIndex];
  const progress = subtopics.length > 0 ? ((currentSubtopicIndex + 1) / subtopics.length) * 100 : 0;

  const currentTopicIndex = allTopics.findIndex(t => t.id === topic.id);
  const canGoPrevTopic = currentTopicIndex > 0;
  const canGoNextTopic = currentTopicIndex < allTopics.length - 1;

  const handlePrevSubtopic = () => {
    if (currentSubtopicIndex > 0) {
      setCurrentSubtopicIndex(currentSubtopicIndex - 1);
    } else if (canGoPrevTopic) {
      const prevTopic = allTopics[currentTopicIndex - 1];
      onTopicChange(prevTopic.id);
      const prevSubtopics = prevTopic.subtopics || (prevTopic as unknown as { lessons?: unknown[] }).lessons || [];
      setCurrentSubtopicIndex(prevSubtopics.length - 1);
    }
  };

  const handleNextSubtopic = () => {
    if (currentSubtopicIndex < subtopics.length - 1) {
      setCurrentSubtopicIndex(currentSubtopicIndex + 1);
    } else if (canGoNextTopic) {
      const nextTopic = allTopics[currentTopicIndex + 1];
      onTopicChange(nextTopic.id);
      setCurrentSubtopicIndex(0);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'quiz':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{topic.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {currentSubtopicIndex + 1} of {subtopics.length} • {topic.estimatedTime}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Progress</div>
              <div className="text-xs text-muted-foreground">{Math.round(progress)}%</div>
            </div>
          </div>
          <Progress value={progress} className="h-2 mt-4" />
        </DialogHeader>

        <div className="mt-6">
          {/* Current Subtopic Content */}
          {currentSubtopic ? (
            <div className="bg-muted/30 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  {getContentTypeIcon(currentSubtopic.type)}
                </div>
                <div>
                  <h3 className="font-semibold">{currentSubtopic.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentSubtopic.description}</p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {currentSubtopic.estimatedTime}
                </Badge>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <p>{currentSubtopic.content}</p>
              </div>

              {/* Mock content based on type */}
              {currentSubtopic.type === 'video' && (
                <div className="bg-black/5 rounded-lg p-8 mt-4 text-center">
                  <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Video content would appear here</p>
                </div>
              )}

              {currentSubtopic.type === 'quiz' && (
                <div className="bg-primary/5 rounded-lg p-4 mt-4">
                  <div className="text-sm font-medium mb-2">Knowledge Check</div>
                  <p className="text-sm text-muted-foreground">Interactive quiz would appear here</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-8 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Content Coming Soon</h3>
              <p className="text-muted-foreground">
                Lessons for this topic are being prepared. Check back soon for updates!
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevSubtopic}
              disabled={currentSubtopicIndex === 0 && !canGoPrevTopic}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {subtopics.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSubtopicIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSubtopicIndex 
                      ? 'bg-primary' 
                      : index < currentSubtopicIndex 
                        ? 'bg-green-500' 
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNextSubtopic}
              disabled={currentSubtopicIndex === subtopics.length - 1 && !canGoNextTopic}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
