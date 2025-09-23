import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { Progress } from '@/models/Progress';
import { CreditTransaction } from '@/models/CreditTransaction';
import { withAuth, AuthUser } from '@/lib/auth';

// GET /api/admin/users - Get all users with filtering and pagination
export const GET = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    
    const skip = (page - 1) * limit;
    
    // Build filter query
    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      filter.role = role;
    }
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);
    
    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [progressCount, completedCount, totalCredits] = await Promise.all([
          Progress.countDocuments({ userId: user._id }),
          Progress.countDocuments({ userId: user._id, status: 'completed' }),
          CreditTransaction.aggregate([
            { $match: { userId: user._id } },
            {
              $group: {
                _id: null,
                totalEarned: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'earned'] }, '$amount', 0]
                  }
                },
                totalSpent: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'spent'] }, '$amount', 0]
                  }
                }
              }
            }
          ])
        ]);
        
        const creditStats = totalCredits[0] || { totalEarned: 0, totalSpent: 0 };
        
        return {
          ...user.toObject(),
          stats: {
            totalLessons: progressCount,
            completedLessons: completedCount,
            completionRate: progressCount > 0 ? ((completedCount / progressCount) * 100).toFixed(1) : '0',
            totalCreditsEarned: creditStats.totalEarned,
            totalCreditsSpent: creditStats.totalSpent
          }
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', success: false },
      { status: 500 }
    );
  }
}, ['admin']);

// POST /api/admin/users - Create a new user (admin only)
export const POST = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { name, email, role, password } = body;
    
    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required', success: false },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists', success: false },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles = ['learner', 'mentor', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified', success: false },
        { status: 400 }
      );
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      role,
      password: password || 'tempPassword123', // Temporary password
      isActive: true,
      profile: {
        credits: 0,
        completedLessons: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    });
    
    await newUser.save();
    
    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;
    
    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', success: false },
      { status: 500 }
    );
  }
}, ['admin']);
