'use client';

import { useState } from 'react';
import { Play, BookOpen, ArrowRightLeft, Coins, ShieldCheck, Code, ArrowRight, Award } from 'lucide-react';
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
  index: number;
  completedLessonsCount?: number;
  totalLessonsCount?: number;
}

const TOPIC_GRADIENTS = [
  {
    card: "from-sky-500/25 via-blue-500/20 to-indigo-500/25",
    border: "border-sky-400/40",
    icon: "bg-sky-400/30 text-sky-100",
    arrow: "text-sky-100",
    shadow: "shadow-[0_12px_40px_-18px_rgba(59,130,246,0.65)]",
  },
  {
    card: "from-violet-600/25 via-purple-500/20 to-fuchsia-500/25",
    border: "border-fuchsia-400/40",
    icon: "bg-fuchsia-400/30 text-fuchsia-100",
    arrow: "text-fuchsia-100",
    shadow: "shadow-[0_12px_40px_-18px_rgba(192,132,252,0.6)]",
  },
  {
    card: "from-amber-500/25 via-orange-500/20 to-rose-500/25",
    border: "border-amber-400/40",
    icon: "bg-amber-400/30 text-amber-100",
    arrow: "text-amber-100",
    shadow: "shadow-[0_12px_40px_-18px_rgba(251,191,36,0.55)]",
  },
  {
    card: "from-emerald-500/25 via-teal-500/20 to-lime-500/25",
    border: "border-emerald-400/40",
    icon: "bg-emerald-400/30 text-emerald-100",
    arrow: "text-emerald-100",
    shadow: "shadow-[0_12px_40px_-18px_rgba(52,211,153,0.55)]",
  },
  {
    card: "from-rose-500/25 via-pink-500/20 to-purple-500/25",
    border: "border-rose-400/40",
    icon: "bg-rose-400/30 text-rose-100",
    arrow: "text-rose-100",
    shadow: "shadow-[0_12px_40px_-18px_rgba(244,114,182,0.55)]",
  },
  {
    card: "from-cyan-500/25 via-teal-500/20 to-blue-500/25",
    border: "border-cyan-400/40",
    icon: "bg-cyan-400/30 text-cyan-100",
    arrow: "text-cyan-100",
    shadow: "shadow-[0_12px_40px_-18px_rgba(34,211,238,0.55)]",
  },
];

function getTopicIcon(topic: Topic) {
  const title = topic.title.toLowerCase();
  if (title.includes('fundamentals')) return <BookOpen className="h-5 w-5" />;
  if (title.includes('messaging') || title.includes('transfer')) return <ArrowRightLeft className="h-5 w-5" />;
  if (title.includes('tokenomics')) return <Coins className="h-5 w-5" />;
  if (title.includes('permissioned')) return <ShieldCheck className="h-5 w-5" />;
  if (title.includes('evm')) return <Code className="h-5 w-5" />;
  return <Play className="h-5 w-5" />;
}

function TopicNode({ topic, isCompleted, isLocked, onTopicClick, index, completedLessonsCount = 0, totalLessonsCount = 0 }: TopicNodeProps) {
  const getGradientVisuals = () => {
    if (isLocked) {
      return {
        card: 'bg-gray-900/40 border-gray-700 text-gray-400',
        icon: 'bg-gray-700 text-gray-400',
        arrow: 'text-gray-500',
        progress: 'bg-gray-600 text-gray-300',
        extra: '',
      };
    }

    if (isCompleted) {
      return {
        card: 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/15 to-emerald-400/25 border-emerald-400/60 text-emerald-50 shadow-[0_14px_45px_-15px_rgba(16,185,129,0.65)]',
        icon: 'bg-emerald-500/30 text-emerald-100',
        arrow: 'text-emerald-100',
        progress: 'bg-emerald-500/30 text-emerald-100',
        extra: 'ring-1 ring-emerald-400/40',
      };
    }

    const palette = TOPIC_GRADIENTS[index % TOPIC_GRADIENTS.length];
    return {
      card: `bg-gradient-to-r ${palette.card} ${palette.border} text-white/90 ${palette.shadow}`,
      icon: palette.icon,
      arrow: palette.arrow,
      progress: `${palette.icon.replace('text-', 'text-')}`,
      extra: 'ring-1 ring-white/5',
    };
  };

  const visuals = getGradientVisuals();
  const progressPercentage = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

  return (
    <div
      onClick={() => !isLocked && onTopicClick(topic.id)}
      className={`w-full flex items-center p-4 rounded-xl border transition-all duration-300 group ${visuals.card} ${visuals.extra} ${!isLocked ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl' : 'cursor-not-allowed'}`}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">{topic.title}</h3>
        <p className="text-sm text-white/80 line-clamp-2">{topic.description}</p>
      </div>
      <div className="flex items-center gap-3 ml-4 flex-shrink-0">
        {/* Progress Badge */}
        {totalLessonsCount > 0 && (
          <div className={`px-3 py-1.5 rounded-full ${visuals.progress} backdrop-blur-sm flex items-center gap-1.5`}>
            <span className="text-xs font-semibold">{completedLessonsCount}/{totalLessonsCount}</span>
            <span className="text-xs opacity-80">({progressPercentage}%)</span>
          </div>
        )}
        <div className={`p-2 rounded-full ${visuals.icon}`}>
          {getTopicIcon(topic)}
        </div>
        <ArrowRight className={`h-5 w-5 transition-colors ${visuals.arrow} group-hover:text-white`} />
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

  // Unlock all topics with published lessons
  const isTopicLocked = (topicIndex: number) => {
    const topic = topics[topicIndex];
    // If topic has at least one published lesson, unlock it
    if (topic.lessons && topic.lessons.length > 0) {
      return false;
    }
    // Otherwise, use the old logic for sequential unlocking
    if (topicIndex === 0) return false;
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
          {/* Mobile: Stack content vertically, Desktop: Horizontal layout */}
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Title Section */}
            <div className="flex-1">
              <p className="text-lg sm:text-xl font-semibold text-muted-foreground">Learner Modules</p>
            </div>
            
            {/* Stats Section - Responsive layout */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {/* Progress Stats */}
              <div className="text-left sm:text-right">
                <div className="text-sm font-medium">{completedCount}/{topics.length} completed</div>
                <div className="text-xs text-muted-foreground">{Math.round(progressPercentage)}% progress</div>
              </div>
              
              {/* Credits Badge */}
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">+{course.creditsReward ?? course.creditReward} credits</span>
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

      {/* Topics Roadmap */}
      <div className="container mx-auto px-4 py-8">
        {topics.length > 0 ? (
          <div className="relative">
            <div className="w-full space-y-4">
              {topics.map((topic, index) => {
                // Calculate lesson progress for this topic
                const totalLessons = topic.subtopics?.length || topic.lessons?.length || 0;
                const completedLessons = topic.subtopics?.filter(st => st.isCompleted).length || 0;
                
                // Debug logging
                console.log(`Topic "${topic.title}":`, {
                  subtopicsLength: topic.subtopics?.length,
                  lessonsLength: topic.lessons?.length,
                  totalLessons,
                  completedLessons,
                });
                
                return (
                  <TopicNode
                    key={topic.id}
                    topic={topic}
                    isCompleted={isTopicCompleted(topic.id)}
                    isLocked={isTopicLocked(index)}
                    onTopicClick={handleTopicClick}
                    index={index}
                    completedLessonsCount={completedLessons}
                    totalLessonsCount={totalLessons}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-20 w-20 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">Course Content Coming Soon</h3>
            <p className="text-muted-foreground max-w-md">
              Our instructors are preparing amazing learning materials for this course. 
              Stay tuned for updates!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
