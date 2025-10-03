export interface LessonSummary {
  id: string;
  title: string;
  isCompleted?: boolean;
  type?: 'text' | 'video' | 'quiz' | 'interactive' | 'article' | 'task';
  // Add other lesson properties as needed
}
// Academy and Learning Types - Roadmap Structure
import { UserRole } from './user';

export interface LessonQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface LessonQuiz {
  passingScore: number;
  questions: LessonQuizQuestion[];
}

export interface Subtopic {
  id: string;
  title: string;
  description?: string; // made optional to accommodate existing mock data
  content?: string;
  type: 'text' | 'video' | 'quiz' | 'interactive' | 'article' | 'task';
  estimatedTime?: string;
  isCompleted?: boolean;
  resources?: Resource[];
  videoUrl?: string | null;
  quiz?: LessonQuiz;
  order?: number;
  slug?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  subtopics?: Subtopic[];
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
  summary?: string;
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
  quiz?: LessonQuiz;
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
  questions: LessonQuizQuestion[];
  passingScore: number;
  timeLimit?: number;
}

export type Question = LessonQuizQuestion;

export interface UserProgress {
  courseId: string;
  completedModules: string[];
  completedTopics: string[];
  completedSubtopics: string[];
  lastAccessedModule?: string;
  lastAccessedTopic?: string;
  totalTimeSpent: number;
}
