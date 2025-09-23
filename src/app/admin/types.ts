// Type definitions for admin interfaces
// Note: AuthUser is imported from @/lib/auth for authentication

export interface IUser {
  _id: string;
  email: string;
  name: string;
  roles: string[];
  profile?: {
    avatarUrl?: string;
    bio?: string;
    credits?: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICourse {
  _id: string;
  title: string;
  description: string;
  track: 'beginner' | 'intermediate' | 'advanced';
  credits: number;
  estimatedHours: number;
  order: number;
  status: 'draft' | 'published';
  thumbnail?: string;
  tags: string[];
  slug: string;
  createdBy?: {
    _id: string;
    name: string;
  } | string;
  updatedBy?: {
    _id: string;
    name: string;
  } | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITopic {
  _id: string;
  title: string;
  summary: string;
  courseId: string | ICourse;
  estimatedMinutes: number;
  order: number;
  status: 'draft' | 'published';
  slug: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILesson {
  _id: string;
  title: string;
  description: string;
  topicId: string | ITopic;
  type: 'reading' | 'video' | 'quiz';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  content?: string;
  videoUrl?: string;
  resources?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  quiz?: {
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>;
    passingScore: number;
  };
  order: number;
  isActive: boolean;
  slug: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
