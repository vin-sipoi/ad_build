// API endpoint for a single course
import { NextRequest, NextResponse } from 'next/server';
import { Course } from '@/types';

// Residency Academy modules - same data as main courses API
const mockCourses: Course[] = [
  {
    _id: '1',
    title: 'Founder Mindset & Vision',
    description: 'Develop the entrepreneurial mindset and create a compelling vision for your startup.',
    thumbnail: '/course-placeholder.jpg',
    modules: [
      {
        id: '1-1',
        title: 'The Entrepreneur Within',
        description: 'Discovering your entrepreneurial potential',
        lessons: [
          { id: '1-1-1', title: 'What Makes a Successful Founder?', content: '', type: 'video', duration: 15, order: 1, resources: [] },
          { id: '1-1-2', title: 'Mindset Quiz', content: '', type: 'quiz', duration: 10, order: 2, resources: [] },
        ],
        order: 1,
        isLocked: false,
      },
      {
        id: '1-2',
        title: 'Vision & Mission',
        description: 'Crafting your startup vision',
        lessons: [
          { id: '1-2-1', title: 'Creating Your Vision Statement', content: '', type: 'text', duration: 20, order: 1, resources: [] },
          { id: '1-2-2', title: 'Mission Workshop', content: '', type: 'assignment', duration: 30, order: 2, resources: [] },
        ],
        order: 2,
        isLocked: false,
      },
    ],
    requiredRole: ['learner'],
    creditsRequired: 0,
    creditsReward: 100,
    difficulty: 'beginner',
    estimatedHours: 6,
    createdBy: 'adamur',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    title: 'Market Research & Validation',
    description: 'Learn to validate your business idea and understand your target market.',
    thumbnail: '/course-placeholder.jpg',
    modules: [
      {
        id: '2-1',
        title: 'Understanding Your Market',
        description: 'Market analysis fundamentals',
        lessons: [
          { id: '2-1-1', title: 'Market Size & Opportunity', content: '', type: 'video', duration: 18, order: 1, resources: [] },
          { id: '2-1-2', title: 'Competitor Analysis Framework', content: '', type: 'text', duration: 25, order: 2, resources: [] },
        ],
        order: 1,
        isLocked: false,
      },
    ],
    requiredRole: ['learner'],
    creditsRequired: 50,
    creditsReward: 150,
    difficulty: 'beginner',
    estimatedHours: 8,
    createdBy: 'adamur',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '3',
    title: 'MVP Development & Testing',
    description: 'Build and test your minimum viable product effectively.',
    thumbnail: '/course-placeholder.jpg',
    modules: [
      {
        id: '3-1',
        title: 'MVP Strategy',
        description: 'Planning your first product version',
        lessons: [
          { id: '3-1-1', title: 'What is an MVP?', content: '', type: 'video', duration: 12, order: 1, resources: [] },
          { id: '3-1-2', title: 'Feature Prioritization', content: '', type: 'text', duration: 20, order: 2, resources: [] },
        ],
        order: 1,
        isLocked: false,
      },
    ],
    requiredRole: ['learner'],
    creditsRequired: 100,
    creditsReward: 200,
    difficulty: 'intermediate',
    estimatedHours: 12,
    createdBy: 'adamur',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '4',
    title: 'Business Model & Revenue',
    description: 'Design sustainable business models and revenue streams.',
    thumbnail: '/course-placeholder.jpg',
    modules: [
      {
        id: '4-1',
        title: 'Business Model Canvas',
        description: 'Structuring your business model',
        lessons: [
          { id: '4-1-1', title: 'Understanding Business Models', content: '', type: 'video', duration: 22, order: 1, resources: [] },
          { id: '4-1-2', title: 'Revenue Stream Workshop', content: '', type: 'assignment', duration: 45, order: 2, resources: [] },
        ],
        order: 1,
        isLocked: false,
      },
    ],
    requiredRole: ['learner'],
    creditsRequired: 150,
    creditsReward: 250,
    difficulty: 'intermediate',
    estimatedHours: 10,
    createdBy: 'adamur',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '5',
    title: 'Team Building & Leadership',
    description: 'Build and lead high-performing startup teams.',
    thumbnail: '/course-placeholder.jpg',
    modules: [
      {
        id: '5-1',
        title: 'Startup Team Dynamics',
        description: 'Building your founding team',
        lessons: [
          { id: '5-1-1', title: 'Co-founder Selection', content: '', type: 'video', duration: 16, order: 1, resources: [] },
          { id: '5-1-2', title: 'Equity Distribution', content: '', type: 'text', duration: 20, order: 2, resources: [] },
        ],
        order: 1,
        isLocked: false,
      },
    ],
    requiredRole: ['learner'],
    creditsRequired: 200,
    creditsReward: 300,
    difficulty: 'intermediate',
    estimatedHours: 8,
    createdBy: 'adamur',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '6',
    title: 'Fundraising Fundamentals',
    description: 'Prepare for and execute successful fundraising rounds.',
    thumbnail: '/course-placeholder.jpg',
    modules: [
      {
        id: '6-1',
        title: 'Investment Basics',
        description: 'Understanding startup investment',
        lessons: [
          { id: '6-1-1', title: 'Types of Funding', content: '', type: 'video', duration: 18, order: 1, resources: [] },
          { id: '6-1-2', title: 'Valuation Fundamentals', content: '', type: 'text', duration: 25, order: 2, resources: [] },
        ],
        order: 1,
        isLocked: false,
      },
    ],
    requiredRole: ['learner'],
    creditsRequired: 250,
    creditsReward: 400,
    difficulty: 'advanced',
    estimatedHours: 14,
    createdBy: 'adamur',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const course = mockCourses.find(c => c._id === courseId);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }
    
    return NextResponse.json(course);
    
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
