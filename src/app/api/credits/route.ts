// API endpoint for credits management
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real app, verify the Firebase token
    // const token = authHeader.split('Bearer ')[1];
    // const decodedToken = await getAuth().verifyIdToken(token);
    // const userId = decodedToken.uid;

    // For now, get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('adamur_academy');
    
    const transactions = await db.collection('credit_transactions')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json(transactions);
    
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, type, source, description } = body;

    if (!userId || !amount || !type || !source || !description) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('adamur_academy');

    // Create transaction record
    const transaction = {
      userId,
      amount: Number(amount),
      type,
      source,
      description,
      createdAt: new Date(),
    };

    await db.collection('credit_transactions').insertOne(transaction);

    // Update user's credit balance
    const creditChange = type === 'earned' ? amount : -amount;
    await db.collection('users').updateOne(
      { uid: userId },
      { 
        $inc: { credits: creditChange },
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({ success: true, transaction });
    
  } catch (error) {
    console.error('Error creating credit transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
