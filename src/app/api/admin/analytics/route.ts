import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/models/User';
import { Course } from '@/models/Course';
import { Progress } from '@/models/Progress';
import { CreditTransaction } from '@/models/CreditTransaction';
import { MentorApplication } from '@/models/MentorApplication';
import { withAuth, AuthUser } from '@/lib/auth';

// GET /api/admin/analytics - Get comprehensive analytics dashboard data
export const GET = withAuth(async (req: NextRequest, _user: AuthUser) => {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeframe));
    
    // Get user statistics
    const [
      totalUsers,
      activeUsers,
      newUsers,
      usersByRole,
      userGrowth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 
        lastLoginAt: { $gte: startDate } 
      }),
      User.countDocuments({ 
        createdAt: { $gte: startDate } 
      }),
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);
    
    // Get course statistics
    const [
      totalCourses,
      activeCourses,
      courseCompletions,
      popularCourses
    ] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ isActive: true }),
      Progress.countDocuments({ 
        status: 'completed',
        completedAt: { $gte: startDate }
      }),
      Course.aggregate([
        {
          $lookup: {
            from: 'progresses',
            localField: '_id',
            foreignField: 'courseId',
            as: 'progress'
          }
        },
        {
          $addFields: {
            enrollments: { $size: '$progress' },
            completions: {
              $size: {
                $filter: {
                  input: '$progress',
                  cond: { $eq: ['$$this.status', 'completed'] }
                }
              }
            }
          }
        },
        {
          $project: {
            title: 1,
            enrollments: 1,
            completions: 1,
            completionRate: {
              $cond: [
                { $gt: ['$enrollments', 0] },
                { $multiply: [{ $divide: ['$completions', '$enrollments'] }, 100] },
                0
              ]
            }
          }
        },
        { $sort: { enrollments: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    // Get learning progress analytics
    const [
      totalLessonsCompleted,
      averageProgress,
      progressTrends
    ] = await Promise.all([
      Progress.countDocuments({ 
        status: 'completed',
        completedAt: { $gte: startDate }
      }),
      Progress.aggregate([
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$score' },
            averageTimeSpent: { $avg: '$timeSpent' }
          }
        }
      ]),
      Progress.aggregate([
        {
          $match: {
            completedAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$completedAt'
              }
            },
            completions: { $sum: 1 },
            averageScore: { $avg: '$score' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);
    
    // Get credit system analytics
    const [
      totalCreditsIssued,
      totalCreditsSpent,
      creditTransactions,
      topEarners
    ] = await Promise.all([
      CreditTransaction.aggregate([
        {
          $match: {
            type: 'earned',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      CreditTransaction.aggregate([
        {
          $match: {
            type: 'spent',
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]),
      CreditTransaction.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            earned: {
              $sum: {
                $cond: [{ $eq: ['$type', 'earned'] }, '$amount', 0]
              }
            },
            spent: {
              $sum: {
                $cond: [{ $eq: ['$type', 'spent'] }, '$amount', 0]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      User.aggregate([
        {
          $match: {
            'profile.credits': { $gt: 0 }
          }
        },
        {
          $sort: { 'profile.credits': -1 }
        },
        {
          $limit: 10
        },
        {
          $project: {
            name: 1,
            email: 1,
            credits: '$profile.credits'
          }
        }
      ])
    ]);
    
    // Get mentor application statistics
    const [
      pendingApplications,
      approvedApplications,
      rejectedApplications
    ] = await Promise.all([
      MentorApplication.countDocuments({ 
        status: 'pending',
        createdAt: { $gte: startDate }
      }),
      MentorApplication.countDocuments({ 
        status: 'approved',
        decidedAt: { $gte: startDate }
      }),
      MentorApplication.countDocuments({ 
        status: 'rejected',
        decidedAt: { $gte: startDate }
      })
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        timeframe: parseInt(timeframe),
        users: {
          total: totalUsers,
          active: activeUsers,
          new: newUsers,
          byRole: usersByRole.reduce((acc: Record<string, number>, item: { _id: string; count: number }) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          growth: userGrowth
        },
        courses: {
          total: totalCourses,
          active: activeCourses,
          completions: courseCompletions,
          popular: popularCourses
        },
        learning: {
          totalLessonsCompleted,
          averageScore: averageProgress[0]?.averageScore || 0,
          averageTimeSpent: averageProgress[0]?.averageTimeSpent || 0,
          progressTrends
        },
        credits: {
          totalIssued: totalCreditsIssued[0]?.total || 0,
          totalSpent: totalCreditsSpent[0]?.total || 0,
          transactions: creditTransactions,
          topEarners
        },
        mentors: {
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          approvalRate: (approvedApplications + rejectedApplications) > 0 
            ? ((approvedApplications / (approvedApplications + rejectedApplications)) * 100).toFixed(1)
            : '0'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', success: false },
      { status: 500 }
    );
  }
}, ['admin']);
