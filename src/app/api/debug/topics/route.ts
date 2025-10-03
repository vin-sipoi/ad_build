import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Topic } from '@/models/Topic';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    const topics = await Topic.find({})
      .select('_id title courseId status')
      .lean();
    
    return NextResponse.json({
      count: topics.length,
      topics: topics.map(t => ({
        _id: String(t._id),
        title: t.title,
        courseId: String(t.courseId),
        status: t.status
      }))
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
