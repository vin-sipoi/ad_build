import { NextRequest, NextResponse } from 'next/server';
import { Progress } from '@/models/Progress';
import { Course } from '@/models/Course';
import { User } from '@/models/User';
import { CreditTransaction } from '@/models/CreditTransaction';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from Firebase token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const idToken = authHeader.split(' ')[1];
    let decodedToken;
    
    try {
      if (!adminAuth) {
        throw new Error('Firebase admin not initialized');
      }
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get user from MongoDB
    const user = await User.findOne({ email: decodedToken.email });
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get residency program courses (assuming 'beginner' track is residency)
    const residencyCourses = await Course.find({ 
      track: 'beginner',
      status: 'published' 
    }).sort({ order: 1 });

    const totalResidencyModules = residencyCourses.length;

    // Get user's progress on residency courses
    const userProgress = await Progress.find({
      userId: user._id,
      courseId: { $in: residencyCourses.map(c => c._id) }
    });

    const completedModules = userProgress.filter(p => p.status === 'completed').length;
    const progressPercentage = totalResidencyModules > 0 
      ? Math.round((completedModules / totalResidencyModules) * 100)
      : 0;

    // Calculate total time invested (in hours)
    const totalTimeSeconds = userProgress.reduce((sum, progress) => sum + progress.timeSpentSeconds, 0);
    const totalTimeHours = Math.round(totalTimeSeconds / 3600);

    // Estimate remaining time based on course estimatedHours
    const totalEstimatedHours = residencyCourses.reduce((sum, course) => sum + (course.estimatedHours || 0), 0);
    const remainingHours = Math.max(0, totalEstimatedHours - totalTimeHours);

    // Get user's credits
    const creditTransactions = await CreditTransaction.find({ userId: user._id });
    const totalCreditsEarned = creditTransactions
      .filter(t => t.type === 'earned')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalCreditsSpent = creditTransactions
      .filter(t => t.type === 'spent')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const currentCredits = totalCreditsEarned - totalCreditsSpent;

    // Calculate potential credits from remaining modules
    const remainingModules = totalResidencyModules - completedModules;
    const avgCreditsPerModule = totalResidencyModules > 0 
      ? residencyCourses.reduce((sum, course) => sum + course.credits, 0) / totalResidencyModules
      : 0;
    const potentialCredits = Math.round(remainingModules * avgCreditsPerModule);

    // Determine next milestone
    const nextMilestone = {
      title: 'Complete Residency Program',
      description: `Finish all ${totalResidencyModules} modules to unlock the Lab stage and earn your Admission NFT Badge`,
      modulesLeft: remainingModules,
      isCompleted: completedModules === totalResidencyModules
    };

    const dashboardData = {
      residencyProgram: {
        progress: {
          percentage: progressPercentage,
          completed: completedModules,
          total: totalResidencyModules
        },
        creditsEarned: {
          current: currentCredits,
          total: totalCreditsEarned,
          potential: potentialCredits
        },
        timeInvested: {
          hours: totalTimeHours,
          remaining: remainingHours
        },
        nextMilestone
      },
      user: {
        name: user.name,
        email: user.email,
        roles: user.roles
      }
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
