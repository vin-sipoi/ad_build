// API endpoint for courses - New Topic-based Structure
import { NextResponse } from 'next/server';
import { courses } from '@/data/courses';

export async function GET() {
  try {
  return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
