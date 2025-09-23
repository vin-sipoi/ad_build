"use server";

import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";
import { mockUsers } from "@/lib/mockData";

export async function getUsers(options: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) {
  try {
    await dbConnect();

    const { page = 1, limit = 10, search = '', role = '' } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') {
      filter.roles = role;
    }

    const [users, total] = await Promise.all([
      User.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'credittransactions',
            localField: '_id',
            foreignField: 'userId',
            as: 'transactions'
          }
        },
        {
          $addFields: {
            totalTransactions: { $size: '$transactions' },
            lastActivity: { $max: '$transactions.createdAt' }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            name: 1,
            email: 1,
            roles: 1,
            profile: 1,
            totalTransactions: 1,
            lastActivity: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]),
      User.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(users)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Fallback to mock data
    const { page = 1, limit = 10, search = '', role = '' } = options;
    let filteredUsers = mockUsers;
    
    if (search) {
      filteredUsers = mockUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (role && role !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.roles.includes(role));
    }
    
    const total = filteredUsers.length;
    const skip = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(skip, skip + limit);
    
    return {
      success: true,
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export async function updateUserRole(id: string, roles: string[]) {
  try {
    await dbConnect();
    const user = await User.findByIdAndUpdate(id, { roles }, { new: true });
    revalidatePath("/admin/users");
    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function getUserById(id: string) {
  try {
    await dbConnect();
    const user = await User.findById(id);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return { success: false, error: "Failed to fetch user" };
  }
}

export async function deleteUser(id: string) {
  try {
    await dbConnect();
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    revalidatePath("/admin/users");
    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    return { success: false, error: "Failed to delete user" };
  }
}

export async function updateUserCredits(id: string, creditChange: number, note: string) {
  try {
    await dbConnect();
    
    // Import CreditTransaction model
    const { CreditTransaction } = await import('@/models/CreditTransaction');
    
    // Update user credits
    const user = await User.findById(id);
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    const currentCredits = user.profile?.credits || 0;
    const newCredits = Math.max(0, currentCredits + creditChange);
    
    await User.findByIdAndUpdate(id, {
      'profile.credits': newCredits
    });
    
    // Create transaction record
    await CreditTransaction.create({
      userId: id,
      source: 'manual',
      amount: creditChange,
      note: note,
      createdBy: "507f1f77bcf86cd799439011" // TODO: Replace with actual admin user ID
    });
    
    revalidatePath("/admin/users");
    return { success: true, data: { newCredits, creditChange } };
  } catch (error) {
    console.error(`Error updating user credits ${id}:`, error);
    return { success: false, error: "Failed to update user credits" };
  }
}

export async function getUserCreditHistory(id: string) {
  try {
    await dbConnect();
    
    const { CreditTransaction } = await import('@/models/CreditTransaction');
    
    const transactions = await CreditTransaction.find({ userId: id })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(50);
    
    return { success: true, data: JSON.parse(JSON.stringify(transactions)) };
  } catch (error) {
    console.error(`Error fetching credit history ${id}:`, error);
    return { success: false, error: "Failed to fetch credit history" };
  }
}

export async function updateUserProfile(id: string, updates: {
  name?: string;
  email?: string;
  roles?: string[];
  profile?: {
    avatarUrl?: string;
    bio?: string;
  };
}) {
  try {
    await dbConnect();
    
    const updateData: Record<string, unknown> = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.roles) updateData.roles = updates.roles;
    if (updates.profile) {
      if (updates.profile.avatarUrl) updateData['profile.avatarUrl'] = updates.profile.avatarUrl;
      if (updates.profile.bio) updateData['profile.bio'] = updates.profile.bio;
    }
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) {
      return { success: false, error: "User not found" };
    }
    
    revalidatePath("/admin/users");
    return { success: true, data: JSON.parse(JSON.stringify(user)) };
  } catch (error) {
    console.error(`Error updating user profile ${id}:`, error);
    return { success: false, error: "Failed to update user profile" };
  }
}

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  roles: string[];
  profile?: {
    bio?: string;
    avatarUrl?: string;
    credits?: number;
  };
}) {
  try {
    await dbConnect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }
    
    // Create new user
    const newUser = new User({
      name: userData.name,
      email: userData.email,
      password: userData.password, // In production, this should be hashed
      roles: userData.roles,
      profile: {
        bio: userData.profile?.bio,
        avatarUrl: userData.profile?.avatarUrl,
        credits: userData.profile?.credits || 100
      },
      createdAt: new Date(),
      lastLoginAt: null
    });
    
    const savedUser = await newUser.save();
    
    // If starting credits are provided, create initial credit transaction
    if (userData.profile?.credits && userData.profile.credits > 0) {
      const { CreditTransaction } = await import("@/models/CreditTransaction");
      await new CreditTransaction({
        userId: savedUser._id,
        type: 'earn',
        amount: userData.profile.credits,
        description: 'Initial account credits',
        createdAt: new Date()
      }).save();
    }
    
    revalidatePath("/admin/users");
    return { success: true, data: JSON.parse(JSON.stringify(savedUser)) };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: "Failed to create user" };
  }
}
