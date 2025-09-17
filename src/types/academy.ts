// Academy and Learning Types
import { UserRole } from './user';
export interface Course {
  _id?: string;
  title: string;
  description: string;
  thumbnail: string;
  modules: Module[];
  requiredRole: UserRole[];
  creditsRequired: number;
  creditsReward: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
  isLocked: boolean;
}

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
