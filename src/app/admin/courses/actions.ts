"use server";

import { dbConnect } from "@/lib/db";
import { Course } from "@/models/Course";
import { ICourse } from "../types";
import { revalidatePath } from "next/cache";
import { mockCourses } from "@/lib/mockData";
import mongoose from "mongoose";

export async function getCourses(options: {
  page?: number;
  limit?: number;
  search?: string;
  track?: string;
}) {
  try {
    await dbConnect();

    const { page = 1, limit = 10, search = '', track = '' } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (track) {
      filter.track = track;
    }

    const [courses, total] = await Promise.all([
      Course.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'topics',
            localField: '_id',
            foreignField: 'courseId',
            as: 'topics'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'createdBy',
            foreignField: '_id',
            as: 'createdBy'
          }
        },
        {
          $addFields: {
            topicCount: { $size: '$topics' },
            createdBy: { $arrayElemAt: ['$createdBy', 0] }
          }
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            title: 1,
            description: 1,
            track: 1,
            credits: 1,
            estimatedHours: 1,
            order: 1,
            status: 1,
            thumbnail: 1,
            tags: 1,
            slug: 1,
            topicCount: 1,
            'createdBy.name': 1,
            'createdBy._id': 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]),
      Course.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(courses)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    // Fallback to mock data when database is unavailable
    const { page = 1, limit = 10, search = '', track = '' } = options;
    let filteredCourses = mockCourses;
    
    if (search) {
      filteredCourses = mockCourses.filter(course => 
        course.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (track) {
      filteredCourses = filteredCourses.filter(course => course.track === track);
    }
    
    const total = filteredCourses.length;
    const skip = (page - 1) * limit;
    const paginatedCourses = filteredCourses.slice(skip, skip + limit);
    
    return {
      success: true,
      data: paginatedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export async function createCourse(data: Omit<ICourse, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
        await dbConnect();
        const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        // TODO: Replace with actual authenticated user ID from auth system
        const userId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011"); // Mock admin user ID from auth.ts
        const course = new Course({
            ...data,
            slug,
            createdBy: userId,
            updatedBy: userId
        });
        await course.save();
        revalidatePath("/admin/courses");
        return { success: true, data: JSON.parse(JSON.stringify(course)) };
    } catch (error) {
        console.error("Error creating course:", error);
        return { success: false, error: "Failed to create course" };
    }
}

export async function updateCourse(id: string, data: Partial<ICourse>) {
    try {
        await dbConnect();
        const slug = data.title?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        // TODO: Replace with actual authenticated user ID
        const userId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
        const course = await Course.findByIdAndUpdate(id, {
            ...data,
            slug,
            updatedBy: userId
        }, { new: true });
        revalidatePath("/admin/courses");
        revalidatePath(`/admin/courses/${id}`);
        return { success: true, data: JSON.parse(JSON.stringify(course)) };
    } catch (error) {
        console.error("Error updating course:", error);
        return { success: false, error: "Failed to update course" };
    }
}

export async function getCourseById(id: string) {
    try {
        await dbConnect();
        const course = await Course.findById(id);
        if (!course) {
            return { success: false, error: "Course not found" };
        }
        return { success: true, data: JSON.parse(JSON.stringify(course)) };
    } catch (error) {
        console.error(`Error fetching course ${id}:`, error);
        return { success: false, error: "Failed to fetch course" };
    }
}

export async function deleteCourse(id: string) {
    try {
        await dbConnect();
        const course = await Course.findByIdAndDelete(id);
        if (!course) {
            return { success: false, error: "Course not found" };
        }
        revalidatePath("/admin/courses");
        return { success: true, data: JSON.parse(JSON.stringify(course)) };
    } catch (error) {
        console.error(`Error deleting course ${id}:`, error);
        return { success: false, error: "Failed to delete course" };
    }
}
