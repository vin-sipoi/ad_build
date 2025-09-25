import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Course } from '@/models/Course';
import { Topic } from '@/models/Topic';

export async function POST(_req: NextRequest) {
  try {
    await dbConnect();

    // Get all courses
    const courses = await Course.find({});
    
    if (courses.length === 0) {
      return NextResponse.json({ error: 'No courses found. Please create courses first.' }, { status: 400 });
    }

    // Check if topics already exist
    const existingTopics = await Topic.countDocuments();
    if (existingTopics > 0) {
      return NextResponse.json({ message: 'Topics already exist', count: existingTopics });
    }

    // Create sample topics for each course
    const sampleTopics = [];
    
    for (const course of courses) {
      sampleTopics.push(
        {
          title: `Introduction to ${course.title}`,
          slug: `introduction-to-${course.slug}`,
          description: `Basic concepts and fundamentals of ${course.title}`,
          courseId: course._id,
          order: 1,
          isActive: true
        },
        {
          title: `Advanced ${course.title.split(' ')[0]} Concepts`,
          slug: `advanced-${course.slug.split('-')[0]}-concepts`,
          description: `Deep dive into advanced topics in ${course.title}`,
          courseId: course._id,
          order: 2,
          isActive: true
        }
      );
    }

    const createdTopics = await Topic.insertMany(sampleTopics);

    return NextResponse.json({ 
      message: 'Sample topics created successfully!', 
      count: createdTopics.length,
      topics: createdTopics 
    });

  } catch (error) {
    console.error('Error creating sample topics:', error);
    return NextResponse.json({ error: 'Failed to create sample topics' }, { status: 500 });
  }
}