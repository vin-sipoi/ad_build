// Gamification and Credits Types
export interface CreditTransaction {
  _id?: string;
  userId: string;
  amount: number;
  type: 'earned' | 'spent';
  source: 'course_completion' | 'quiz_pass' | 'badge_earned' | 'admin_grant';
  description: string;
  createdAt: Date;
}

export interface NFTBadge {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  contractAddress: string;
  tokenId: string;
  type: 'admission' | 'lab' | 'launchpad' | 'alumni';
  requirements: BadgeRequirement[];
  isActive: boolean;
}

export interface BadgeRequirement {
  type: 'course_completion' | 'credit_threshold' | 'time_spent' | 'quiz_score';
  value: string | number;
  description: string;
}

export interface Leaderboard {
  userId: string;
  userName: string;
  userImage?: string;
  totalCredits: number;
  badgesCount: number;
  rank: number;
  journeyStage: string;
}

export interface GameProgress {
  userId: string;
  totalCredits: number;
  badgesEarned: string[];
  coursesCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: Date;
}
