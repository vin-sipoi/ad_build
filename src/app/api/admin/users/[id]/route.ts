import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { Progress } from '@/models/Progress';
import { CreditTransaction } from '@/models/CreditTransaction';
import { withAuth, AuthUser } from '@/lib/auth';

// GET /api/admin/users/[id] - Get user by ID with detailed stats
export const GET = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const targetUser = await User.findById(id).select('-password');
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Get detailed user statistics
    const [
      progressStats,
      creditStats,
      recentProgress,
      recentTransactions
    ] = await Promise.all([
      Progress.aggregate([
        { $match: { userId: targetUser._id } },
        {
          $group: {
            _id: null,
            totalLessons: { $sum: 1 },
            completedLessons: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            averageScore: { $avg: '$score' },
            totalTimeSpent: { $sum: '$timeSpent' }
          }
        }
      ]),
      CreditTransaction.aggregate([
        { $match: { userId: targetUser._id } },
        {
          $group: {
            _id: null,
            totalEarned: {
              $sum: { $cond: [{ $eq: ['$type', 'earned'] }, '$amount', 0] }
            },
            totalSpent: {
              $sum: { $cond: [{ $eq: ['$type', 'spent'] }, '$amount', 0] }
            },
            transactionCount: { $sum: 1 }
          }
        }
      ]),
      Progress.find({ userId: targetUser._id })
        .populate('courseId', 'title')
        .populate('topicId', 'title')
        .populate('lessonId', 'title')
        .sort({ updatedAt: -1 })
        .limit(10),
      CreditTransaction.find({ userId: targetUser._id })
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    const stats = progressStats[0] || {
      totalLessons: 0,
      completedLessons: 0,
      averageScore: 0,
      totalTimeSpent: 0
    };

    const credits = creditStats[0] || {
      totalEarned: 0,
      totalSpent: 0,
      transactionCount: 0
    };

    return NextResponse.json({
      success: true,
      data: {
        ...targetUser.toObject(),
        detailedStats: {
          learning: {
            totalLessons: stats.totalLessons,
            completedLessons: stats.completedLessons,
            completionRate: stats.totalLessons > 0
              ? ((stats.completedLessons / stats.totalLessons) * 100).toFixed(1)
              : '0',
            averageScore: stats.averageScore ? stats.averageScore.toFixed(1) : '0',
            totalTimeSpent: stats.totalTimeSpent || 0
          },
          credits: {
            totalEarned: credits.totalEarned,
            totalSpent: credits.totalSpent,
            currentBalance: targetUser.profile?.credits || 0,
            transactionCount: credits.transactionCount
          }
        },
        recentActivity: {
          progress: recentProgress,
          transactions: recentTransactions
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details', success: false },
      { status: 500 }
    );
  }
}, ['admin']);

// PUT /api/admin/users/[id] - Update user
export const PUT = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    await dbConnect();

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    const body = await req.json();
    const { name, email, role, isActive, credits } = body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Prevent self-deactivation for admins
    if (user.id === id && isActive === false) {
      return NextResponse.json(
        { error: 'You cannot deactivate your own account', success: false },
        { status: 400 }
      );
    }

    // Validate role change
    if (role) {
      const validRoles = ['learner', 'mentor', 'admin'];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: 'Invalid role specified', success: false },
          { status: 400 }
        );
      }
    }

    // Check for email conflicts
    if (email && email !== targetUser.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: id }
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use by another user', success: false },
          { status: 400 }
        );
      }
    }

    // Update user fields
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle credits update
    if (credits !== undefined && credits !== targetUser.profile?.credits) {
      updateData['profile.credits'] = credits;

      // Create credit transaction record
      const difference = credits - (targetUser.profile?.credits || 0);
      if (difference !== 0) {
        await CreditTransaction.create({
          userId: targetUser._id,
          type: difference > 0 ? 'earned' : 'spent',
          amount: Math.abs(difference),
          reason: difference > 0 ? 'Admin credit adjustment' : 'Admin credit deduction',
          description: `Credits ${difference > 0 ? 'added' : 'removed'} by admin`
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user', success: false },
      { status: 500 }
    );
  }
}, ['admin']);

// DELETE /api/admin/users/[id] - Delete user
export const DELETE = withAuth(async (req: NextRequest, user: AuthUser) => {
  try {
    await dbConnect();

    // Extract ID from URL
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required', success: false },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (user.id === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account', success: false },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Check if user has progress records
    const progressCount = await Progress.countDocuments({ userId: targetUser._id });
    if (progressCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with learning progress. Deactivate instead.', success: false },
        { status: 400 }
      );
    }

    // Delete user and related records
    await Promise.all([
      User.findByIdAndDelete(id),
      CreditTransaction.deleteMany({ userId: targetUser._id })
    ]);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', success: false },
      { status: 500 }
    );
  }
}, ['admin']);
