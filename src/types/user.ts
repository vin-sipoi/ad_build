// User Types and Interfaces
export type UserRole = 
  | 'learner' 
  | 'mentor' 
  | 'investor' 
  | 'superadmin' 
  | 'partner_admin';

export type JourneyStage = 
  | 'residency' 
  | 'lab' 
  | 'launchpad' 
  | 'alumni';

export interface User {
  _id?: string;
  name: string;
  email: string;
  image?: string;
  emailVerified?: Date;
  role: UserRole;
  journeyStage?: JourneyStage;
  credits: number;
  nftBadges: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  bio?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  skills: string[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  badgeUrl?: string;
  earnedAt: Date;
  type: 'admission' | 'lab' | 'launchpad' | 'alumni';
}

export interface UserProgress {
  userId: string;
  courseId: string;
  moduleId: string;
  completedLessons: string[];
  progressPercentage: number;
  lastAccessedAt: Date;
}
