"use server";

import { dbConnect } from "@/lib/db";
import { MentorApplication } from "@/models/MentorApplication";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";
import { mockMentorApplications } from "@/lib/mockData";

export async function getMentorApplications(options: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  try {
    await dbConnect();

    const { page = 1, limit = 10, status = '' } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const [applications, total] = await Promise.all([
      MentorApplication.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MentorApplication.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(applications)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching mentor applications:', error);
    
    // Fallback to mock data
    const { page = 1, limit = 10, status = '' } = options;
    let filteredApplications = mockMentorApplications;
    
    if (status && status !== 'all') {
      filteredApplications = mockMentorApplications.filter(app => app.status === status);
    }
    
    const total = filteredApplications.length;
    const skip = (page - 1) * limit;
    const paginatedApplications = filteredApplications.slice(skip, skip + limit);
    
    return {
      success: true,
      data: paginatedApplications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export async function updateMentorApplicationStatus(
  id: string,
  status: 'approved' | 'rejected',
  decidedBy: string,
  rejectionReason?: string
) {
  try {
    await dbConnect();

    const updateData: Record<string, unknown> = {
      status,
      decidedBy,
      decidedAt: new Date()
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const application = await MentorApplication.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');

    if (status === 'approved') {
      // Update user role to include mentor
      await User.findByIdAndUpdate(application?.userId, {
        $addToSet: { roles: 'mentor' }
      });
    }

    revalidatePath("/admin/mentor-applications");
    return { success: true, data: JSON.parse(JSON.stringify(application)) };
  } catch (error) {
    console.error("Error updating mentor application:", error);
    return { success: false, error: "Failed to update mentor application" };
  }
}

export async function getMentorApplicationById(id: string) {
  try {
    await dbConnect();
    const application = await MentorApplication.findById(id)
      .populate('userId', 'name email')
      .populate('decidedBy', 'name');
    if (!application) {
      return { success: false, error: "Mentor application not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(application)) };
  } catch (error) {
    console.error(`Error fetching mentor application ${id}:`, error);
    return { success: false, error: "Failed to fetch mentor application" };
  }
}
