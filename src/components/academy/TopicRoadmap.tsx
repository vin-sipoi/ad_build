'use client';

import { useState } from 'react';
import { Play, Clock, Award, BookOpen, ArrowRightLeft, Coins, ShieldCheck, Code, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Course, Topic } from '@/types/academy';

interface TopicRoadmapProps {
  course: Course;
  onTopicClick?: (topicId: string) => void;
}

interface TopicNodeProps {
  topic: Topic;
  isCompleted: boolean;
  isLocked: boolean;
  onTopicClick: (topicId: string) => void;
}

function getTopicIcon(topic: Topic) {
  const title = topic.title.toLowerCase();
  if (title.includes('fundamentals')) return <BookOpen className="h-5 w-5" />;
  if (title.includes('messaging') || title.includes('transfer')) return <ArrowRightLeft className="h-5 w-5" />;
  if (title.includes('tokenomics')) return <Coins className="h-5 w-5" />;
  if (title.includes('permissioned')) return <ShieldCheck className="h-5 w-5" />;
  if (title.includes('evm')) return <Code className="h-5 w-5" />;
  return <Play className="h-5 w-5" />;
}

function TopicNode({ topic, isCompleted, isLocked, onTopicClick }: TopicNodeProps) {
  const getColors = () => {
    if (isLocked) {
      return 'bg-gray-800/50 text-gray-500 border-gray-700';
    }
    if (isCompleted) {
      return 'bg-green-900/50 text-green-300 border-green-700 hover:bg-green-900/80';
    }
    const title = topic.title.toLowerCase();
    if (title.includes('fundamentals')) {
      return 'bg-blue-900/50 text-blue-300 border-blue-700 hover:bg-blue-900/80';
    }
    if (title.includes('messaging') || title.includes('transfer') || title.includes('chainlink')) {
      return 'bg-gray-900/50 text-gray-300 border-gray-700 hover:bg-gray-900/80';
    }
    if (title.includes('tokenomics') || title.includes('evm')) {
        return 'bg-red-900/50 text-red-300 border-red-700 hover:bg-red-900/80';
    }
    if (title.includes('permissioned')) {
        return 'bg-teal-900/50 text-teal-300 border-teal-700 hover:bg-teal-900/80';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700';
  };

  const iconColor = () => {
    if (isLocked) return 'bg-gray-700 text-gray-500';
    if (isCompleted) return 'bg-green-800 text-green-300';
    const title = topic.title.toLowerCase();
    if (title.includes('fundamentals')) return 'bg-blue-800 text-blue-300';
    if (title.includes('messaging') || title.includes('transfer') || title.includes('chainlink')) return 'bg-gray-800 text-gray-300';
    if (title.includes('tokenomics') || title.includes('evm')) return 'bg-red-800 text-red-300';
    if (title.includes('permissioned')) return 'bg-teal-800 text-teal-300';
    return 'bg-slate-700 text-slate-300';
  }

  return (
    <div
      onClick={() => !isLocked && onTopicClick(topic.id)}
      className={`flex items-center p-4 rounded-lg border transition-all duration-300 group ${getColors()} ${!isLocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
    >
      <div className="flex-1">
        <h3 className="font-semibold text-white">{topic.title}</h3>
        <p className="text-sm opacity-80">{topic.description}</p>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <div className={`p-2 rounded-full ${iconColor()}`}>
          {getTopicIcon(topic)}
        </div>
        <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-white transition-colors" />
      </div>
    </div>
  );
}

export function TopicRoadmap({ course, onTopicClick }: TopicRoadmapProps) {
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(
    new Set(['topic-1']) // First topic is unlocked by default
  );

  const topics = course.modules[0]?.topics || [];

  const handleTopicClick = (topicId: string) => {
    if (onTopicClick) {
      onTopicClick(topicId);
    } else {
      // Default behavior - mark as completed and unlock next
      const newCompleted = new Set(completedTopics);
      newCompleted.add(topicId);
      setCompletedTopics(newCompleted);
      
      // Show topic content or navigate to subtopics
      console.log('Navigate to topic:', topicId);
    }
  };

  const isTopicLocked = (topicIndex: number) => {
    if (topicIndex === 0) return false; // First topic is always unlocked
    const previousTopic = topics[topicIndex - 1];
    return previousTopic ? !completedTopics.has(previousTopic.id) : false;
  };

  const isTopicCompleted = (topicId: string) => {
    return completedTopics.has(topicId);
  };

  // Calculate progress
  const completedCount = topics.filter(topic => completedTopics.has(topic.id)).length;
  const progressPercentage = topics.length > 0 ? (completedCount / topics.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back button removed (handled at page level) */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground">Learning Roadmap</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">{completedCount}/{topics.length} completed</div>
                <div className="text-xs text-muted-foreground">{Math.round(progressPercentage)}% progress</div>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">+{course.creditsReward ?? course.creditReward} credits</span>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Course Overview */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Image 
                src={course.thumbnail} 
                alt={course.title}
                width={64}
                height={64}
                className="rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="font-semibold text-lg mb-2">{course.title}</h2>
                <p className="text-muted-foreground mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Earn {course.creditReward} credits</span>
                  </div>
                  <Badge variant="secondary">{course.difficulty}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Topics Roadmap */}
        {topics.length > 0 && (
          <div className="relative">
            <h3 className="text-xl font-semibold mb-8 text-center">Learning Path</h3>
            
            <div className="space-y-4">
              {topics.map((topic, index) => (
                <TopicNode
                  key={topic.id}
                  topic={topic}
                  isCompleted={isTopicCompleted(topic.id)}
                  isLocked={isTopicLocked(index)}
                  onTopicClick={handleTopicClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
