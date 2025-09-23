// Mock data for development when MongoDB is not available
export const mockCourses = [
  {
    _id: '1',
    title: 'Introduction to Blockchain',
    description: 'Learn the fundamentals of blockchain technology',
    track: 'beginner' as const,
    tags: ['blockchain', 'crypto'],
    estimatedHours: 10,
    isActive: true,
    slug: 'intro-to-blockchain',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2', 
    title: 'Advanced DeFi Protocols',
    description: 'Deep dive into decentralized finance',
    track: 'advanced' as const,
    tags: ['defi', 'protocols'],
    estimatedHours: 25,
    isActive: true,
    slug: 'advanced-defi',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockTopics = [
  {
    _id: '1',
    title: 'Blockchain Basics',
    description: 'Understanding distributed ledgers',
    courseId: '1',
    track: 'beginner' as const,
    estimatedHours: 3,
    order: 1,
    isActive: true,
    slug: 'blockchain-basics',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockLessons = [
  {
    _id: '1',
    title: 'What is a Blockchain?',
    description: 'Introduction to blockchain concepts',
    topicId: '1',
    type: 'reading' as const,
    difficulty: 'beginner' as const,
    estimatedMinutes: 30,
    order: 1,
    isActive: true,
    slug: 'what-is-blockchain',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockUsers = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    roles: ['learner'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    name: 'Jane Smith', 
    email: 'jane@example.com',
    roles: ['mentor'],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const mockMentorApplications = [
  {
    _id: '1',
    userId: { name: 'Alice Brown', email: 'alice@example.com' },
    bio: 'Blockchain developer with 5 years experience',
    expertiseTracks: ['defi', 'smart-contracts'],
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
];
