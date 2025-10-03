import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Course } from '@/models/Course';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    const courses = await Course.find({})
      .select('_id title slug status')
      .lean();
    
    return NextResponse.json({
      count: courses.length,
      courses: courses.map(c => ({
        _id: String(c._id),
        title: c.title,
        slug: c.slug,
        status: c.status
      }))
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
