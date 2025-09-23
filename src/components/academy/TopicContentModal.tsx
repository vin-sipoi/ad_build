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
  
  const currentSubtopic = topic.subtopics[currentSubtopicIndex];
  const progress = ((currentSubtopicIndex + 1) / topic.subtopics.length) * 100;

  const currentTopicIndex = allTopics.findIndex(t => t.id === topic.id);
  const canGoPrevTopic = currentTopicIndex > 0;
  const canGoNextTopic = currentTopicIndex < allTopics.length - 1;

  const handlePrevSubtopic = () => {
    if (currentSubtopicIndex > 0) {
      setCurrentSubtopicIndex(currentSubtopicIndex - 1);
    } else if (canGoPrevTopic) {
      const prevTopic = allTopics[currentTopicIndex - 1];
      onTopicChange(prevTopic.id);
      setCurrentSubtopicIndex(prevTopic.subtopics.length - 1);
    }
  };

  const handleNextSubtopic = () => {
    if (currentSubtopicIndex < topic.subtopics.length - 1) {
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
                {currentSubtopicIndex + 1} of {topic.subtopics.length} • {topic.estimatedTime}
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
              {topic.subtopics.map((_, index) => (
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
              disabled={currentSubtopicIndex === topic.subtopics.length - 1 && !canGoNextTopic}
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
