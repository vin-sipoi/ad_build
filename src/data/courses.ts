// Shared mock courses dataset for academy (topic-based)
import { Course } from '@/types/academy';

export const courses: Course[] = [
  {
    _id: '1',
    id: '1',
    title: 'Blockchain Fundamentals',
    description: 'Master the core concepts of blockchain technology and understand how decentralized systems work.',
    instructor: 'Adamur Academy',
    thumbnail: '/course-placeholder.svg',
    difficulty: 'Beginner',
    duration: '4-6 hours',
    estimatedHours: 5,
    creditsRequired: 0,
    creditsReward: 150,
    creditReward: 150,
    enrolledCount: 1247,
    rating: 4.8,
    tags: ['Blockchain', 'Fundamentals', 'Crypto'],
    isEnrolled: false,
    progress: 0,
    modules: [
      {
        id: 'blockchain-fundamentals',
        title: 'Blockchain Fundamentals',
        description: 'Core blockchain concepts and principles',
        estimatedTime: '4-6 hours',
        creditsRequired: 0,
        creditsReward: 150,
        order: 1,
        topics: [
          {
            id: 'topic-1',
            title: 'What is Blockchain?',
            description: 'Understanding the basics of blockchain technology',
            estimatedTime: '45 min',
            isUnlocked: true,
            isCompleted: false,
            isLocked: false,
            subtopics: [
              { id: 'subtopic-1-1', title: 'Introduction to Blockchain', description: 'Overview', content: 'Learn what blockchain is and why it matters', type: 'video', estimatedTime: '15 min', isCompleted: false },
              { id: 'subtopic-1-2', title: 'History of Digital Money', description: 'Evolution', content: 'From gold standard to digital currencies', type: 'text', estimatedTime: '20 min', isCompleted: false },
              { id: 'subtopic-1-3', title: 'Knowledge Check', description: 'Quiz', content: 'Test your understanding', type: 'quiz', estimatedTime: '10 min', isCompleted: false }
            ]
          },
          {
            id: 'topic-2',
            title: 'Decentralization',
            description: 'Understanding decentralized systems and their benefits',
            estimatedTime: '50 min',
            isUnlocked: false,
            isCompleted: false,
            isLocked: true,
            prerequisites: ['topic-1'],
            subtopics: [
              { id: 'subtopic-2-1', title: 'Centralized vs Decentralized', description: 'Comparison', content: 'Compare different system architectures', type: 'video', estimatedTime: '20 min', isCompleted: false },
              { id: 'subtopic-2-2', title: 'Why Decentralization Matters', description: 'Benefits', content: 'Benefits and challenges of decentralized systems', type: 'text', estimatedTime: '20 min', isCompleted: false }
            ]
          }
        ]
      }
    ],
    requiredRole: ['learner'],
    createdBy: 'adamur',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    id: '2',
    title: 'Smart Contract Development',
    description: 'Build and deploy your first smart contracts on Ethereum blockchain.',
    instructor: 'Adamur Academy',
    thumbnail: '/course-placeholder.svg',
    difficulty: 'Intermediate',
    duration: '6-8 hours',
    estimatedHours: 7,
    creditsRequired: 150,
    creditsReward: 250,
    creditReward: 250,
    enrolledCount: 892,
    rating: 4.9,
    tags: ['Smart Contracts', 'Ethereum', 'Solidity'],
    isEnrolled: false,
    progress: 0,
    modules: [
      {
        id: 'smart-contracts',
        title: 'Smart Contract Development',
        description: 'Learn to build decentralized applications',
        estimatedTime: '6-8 hours',
        creditsRequired: 150,
        creditsReward: 250,
        order: 1,
        topics: [
          {
            id: 'topic-sc-1',
            title: 'Ethereum Basics',
            description: 'Understanding the Ethereum platform',
            estimatedTime: '60 min',
            isUnlocked: true,
            isCompleted: false,
            isLocked: false,
            subtopics: [
              { id: 'subtopic-sc-1-1', title: 'What is Ethereum?', description: 'Overview', content: 'Introduction to the world computer', type: 'video', estimatedTime: '20 min', isCompleted: false },
              { id: 'subtopic-sc-1-2', title: 'Gas and Transactions', description: 'Economics', content: 'Understanding Ethereum economics', type: 'text', estimatedTime: '25 min', isCompleted: false }
            ]
          }
        ]
      }
    ],
    requiredRole: ['learner'],
    createdBy: 'adamur',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '3',
    id: '3',
    title: 'DeFi Fundamentals',
    description: 'Explore decentralized finance protocols and learn how money is being reimagined.',
    instructor: 'Adamur Academy',
    thumbnail: '/course-placeholder.svg',
    difficulty: 'Advanced',
    duration: '5-7 hours',
    estimatedHours: 6,
    creditsRequired: 250,
    creditsReward: 350,
    creditReward: 350,
    enrolledCount: 634,
    rating: 4.7,
    tags: ['DeFi', 'Finance', 'Protocols'],
    isEnrolled: false,
    progress: 0,
    modules: [
      {
        id: 'defi-fundamentals',
        title: 'DeFi Fundamentals',
        description: 'Understanding decentralized finance',
        estimatedTime: '5-7 hours',
        creditsRequired: 250,
        creditsReward: 350,
        order: 1,
        topics: [
          {
            id: 'topic-defi-1',
            title: 'What is DeFi?',
            description: 'Introduction to decentralized finance',
            estimatedTime: '60 min',
            isUnlocked: true,
            isCompleted: false,
            isLocked: false,
            subtopics: [
              { id: 'subtopic-defi-1-1', title: 'Traditional vs DeFi', description: 'Comparison', content: 'Comparing financial systems', type: 'video', estimatedTime: '25 min', isCompleted: false },
              { id: 'subtopic-defi-1-2', title: 'DeFi Protocols Overview', description: 'Protocols', content: 'Major DeFi protocols and use cases', type: 'text', estimatedTime: '20 min', isCompleted: false }
            ]
          }
        ]
      }
    ],
    requiredRole: ['learner'],
    createdBy: 'adamur',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];
