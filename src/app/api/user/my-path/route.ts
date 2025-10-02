import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await request.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentPath = Array.isArray(user.myPath) ? [...user.myPath] : [];
    if (!Array.isArray(user.myPath)) {
      user.myPath = currentPath;
    }

    if (!currentPath.includes(courseId)) {
      currentPath.push(courseId);
      user.myPath = currentPath;
      await user.save();
    }

    return NextResponse.json({ message: 'Course added to My Path' });
  } catch (error) {
    console.error('Error in POST /api/user/my-path:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}