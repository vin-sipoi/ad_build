import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    
    // Set a test cookie
    cookieStore.set('test-cookie', 'test-value', {
      maxAge: 60 * 60, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    return NextResponse.json({
      message: 'Test cookie set',
      secure: process.env.NODE_ENV === 'production'
    });
  } catch (error) {
    console.error('Error setting test cookie:', error);
    return NextResponse.json(
      { message: 'Error setting test cookie', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const testCookie = cookieStore.get('test-cookie')?.value;
    const adminCookie = cookieStore.get('admin-session')?.value;
    
    return NextResponse.json({
      testCookie: testCookie || 'not found',
      adminCookie: adminCookie ? `found (${adminCookie.length} chars)` : 'not found',
      allCookies: cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    });
  } catch (error) {
    console.error('Error reading cookies:', error);
    return NextResponse.json(
      { message: 'Error reading cookies', error: String(error) },
      { status: 500 }
    );
  }
}
