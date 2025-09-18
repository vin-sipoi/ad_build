// API endpoint for a single course (topic-based structure)
import { NextRequest, NextResponse } from 'next/server';
import { courses } from '@/data/courses';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const course = courses.find(c => c.id === courseId);

    if (!course) {
      return NextResponse.json({ error: `Course with id ${courseId} not found` }, { status: 404 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error(`Error fetching course:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}
