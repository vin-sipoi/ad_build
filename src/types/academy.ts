export interface LessonSummary {
  id: string;
  title: string;
  // Add other lesson properties as needed
}
// Academy and Learning Types - Roadmap Structure
import { UserRole } from './user';

export interface Subtopic {
  id: string;
  title: string;
  description?: string; // made optional to accommodate existing mock data
  content: string;
  type: 'text' | 'video' | 'quiz' | 'interactive';
  estimatedTime: string;
  isCompleted: boolean;
  resources?: Resource[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  subtopics: Subtopic[];
  estimatedTime: string;
  prerequisites?: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  isLocked: boolean;
  lessons?: LessonSummary[]; // More specific type for dashboard topic unlocking
}

export interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  estimatedTime: string;
  creditsRequired: number;
  creditsReward: number;
  order: number;
}

export interface Course {
  _id?: string;
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  estimatedHours: number;
  modules: Module[];
  creditsRequired: number;
  creditsReward: number; // canonical
  creditReward?: number; // temporary backward compatibility
  enrolledCount: number;
  rating: number;
  tags: string[];
  isEnrolled: boolean;
  progress: number;
  requiredRole?: UserRole[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy interface for backward compatibility
export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  duration: number;
  order: number;
  resources: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  url: string;
  description?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number;
}

export interface Question {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface UserProgress {
  courseId: string;
  completedModules: string[];
  completedTopics: string[];
  completedSubtopics: string[];
  lastAccessedModule?: string;
  lastAccessedTopic?: string;
  totalTimeSpent: number;
}
