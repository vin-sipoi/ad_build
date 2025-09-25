"use server";

import { dbConnect } from "@/lib/db";
import { Lesson } from "@/models/Lesson";
import { Topic } from "@/models/Topic";
import { ILesson } from "../types";
import { revalidatePath } from "next/cache";
import { mockLessons, mockTopics } from "@/lib/mockData";

export async function getLessons(options: {
  page?: number;
  limit?: number;
  search?: string;
  topicId?: string;
  type?: string;
}) {
  try {
    await dbConnect();

    const { page = 1, limit = 10, search = '', topicId = '', type = '' } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (topicId && topicId !== 'all') {
      filter.topicId = topicId;
    }
    if (type && type !== 'all') {
      filter.type = type;
    }

    const [lessons, total] = await Promise.all([
      Lesson.find(filter)
        .populate({
          path: 'topicId',
          select: 'title courseId',
          populate: {
            path: 'courseId',
            select: 'title'
          }
        })
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Lesson.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(lessons)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching lessons:', error);
    
    // Fallback to mock data
    const { page = 1, limit = 10, search = '', topicId = '', type = '' } = options;
    let filteredLessons = mockLessons;
    
    if (search) {
      filteredLessons = mockLessons.filter(lesson => 
        lesson.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (topicId && topicId !== 'all') {
      filteredLessons = filteredLessons.filter(lesson => lesson.topicId === topicId);
    }
    if (type && type !== 'all') {
      filteredLessons = filteredLessons.filter(lesson => lesson.type === type);
    }
    
    const total = filteredLessons.length;
    const skip = (page - 1) * limit;
    const paginatedLessons = filteredLessons.slice(skip, skip + limit);
    
    return {
      success: true,
      data: paginatedLessons,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export async function getAllTopics() {
    try {
        await dbConnect();
        const topics = await Topic.find({}, 'title courseId')
          .populate('courseId', 'title');
        return { success: true, data: JSON.parse(JSON.stringify(topics)) };
    } catch (error) {
        console.error('Error fetching topics:', error);
        return { success: false, error: 'Failed to fetch topics' };
    }
}

export async function createLesson(data: Omit<ILesson, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
        await dbConnect();
        const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        const lesson = new Lesson({ ...data, slug, createdBy: "60d21b4667d0d8992e610c85" });
        await lesson.save();
        revalidatePath("/admin/lessons");
        return { success: true, data: JSON.parse(JSON.stringify(lesson)) };
    } catch (error) {
        console.error("Error creating lesson:", error);
        return { success: false, error: "Failed to create lesson" };
    }
}

export async function updateLesson(id: string, data: Partial<ILesson>) {
    try {
        await dbConnect();
        const slug = data.title?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        const lesson = await Lesson.findByIdAndUpdate(id, { ...data, slug }, { new: true });
        revalidatePath("/admin/lessons");
        revalidatePath(`/admin/lessons/${id}`);
        return { success: true, data: JSON.parse(JSON.stringify(lesson)) };
    } catch (error) {
        console.error("Error updating lesson:", error);
        return { success: false, error: "Failed to update lesson" };
    }
}

export async function getLessonById(id: string) {
    try {
        await dbConnect();
        const lesson = await Lesson.findById(id)
          .populate({
            path: 'topicId',
            select: 'title courseId',
            populate: {
              path: 'courseId',
              select: 'title'
            }
          });
        if (!lesson) {
            return { success: false, error: "Lesson not found" };
        }
        return { success: true, data: JSON.parse(JSON.stringify(lesson)) };
    } catch (error) {
        console.error(`Error fetching lesson ${id}:`, error);
        return { success: false, error: "Failed to fetch lesson" };
    }
}

export async function deleteLesson(id: string) {
    try {
        await dbConnect();
        const lesson = await Lesson.findByIdAndDelete(id);
        if (!lesson) {
            return { success: false, error: "Lesson not found" };
        }
        revalidatePath("/admin/lessons");
        return { success: true, data: JSON.parse(JSON.stringify(lesson)) };
    } catch (error) {
        console.error(`Error deleting lesson ${id}:`, error);
        return { success: false, error: "Failed to delete lesson" };
    }
}
