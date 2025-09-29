"use server";

import { dbConnect } from "@/lib/db";
import { Lesson } from "@/models/Lesson";
import { Topic } from "@/models/Topic";
import { ILesson } from "../types";
import { revalidatePath } from "next/cache";



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
    return {
      success: false,
      error: 'Failed to fetch lessons'
    };
  }
}

// Simple type for lesson form that matches what we actually need
type LessonFormTopic = {
    _id: string;
    title: string;
    courseId: {
        title: string;
    };
};

export async function getAllTopics(): Promise<LessonFormTopic[]> {
    try {
        console.log('getAllTopics: Starting...');
        await dbConnect();
        console.log('getAllTopics: DB connected');
        
        // Get topics with course information
        const topics = await Topic.find({})
            .populate('courseId', 'title')
            .lean();
        
        console.log('getAllTopics: Topics found:', topics.length);
        

        
        // Convert to the expected format for LessonForm
        const serializedTopics = topics.map((topic: Record<string, unknown>) => ({
            _id: String(topic._id),
            title: String(topic.title),
            courseId: {
                title: String((topic.courseId as Record<string, unknown>)?.title) || 'Unknown Course'
            }
        }));
        
        console.log('getAllTopics: First serialized topic:', serializedTopics[0]);
        
        return serializedTopics;
    } catch (error) {
        console.error('getAllTopics: Error fetching topics:', error);
        return [];
    }
}

export async function createLesson(data: Omit<ILesson, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
        await dbConnect();
        
        // Get the topic to find the courseId
        const topic = await Topic.findById(data.topicId);
        if (!topic) {
            return { success: false, error: "Selected topic not found" };
        }
        
        const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        
        // Transform the data to match the Mongoose model
        const lessonData = {
            ...data,
            slug,
            courseId: topic.courseId, // Add the courseId from the topic
            type: data.type === 'reading' ? 'article' : data.type, // Map 'reading' to 'article'
            content: {
                html: data.content || '',
                videoUrl: data.videoUrl || '',
            },
            createdBy: "60d21b4667d0d8992e610c85"
        };
        
        const lesson = new Lesson(lessonData);
        await lesson.save();
        revalidatePath("/admin/lessons");
        return { success: true, data: JSON.parse(JSON.stringify(lesson)) };
    } catch (error) {
        console.error("Error creating lesson:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create lesson" };
    }
}

export async function updateLesson(id: string, data: Partial<ILesson>) {
    try {
        await dbConnect();
        const slug = data.title?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        
        // Transform the data to match the Mongoose model
        const updateData = {
            ...data,
            slug,
            type: data.type === 'reading' ? 'article' : data.type, // Map 'reading' to 'article'
            content: {
                html: data.content || '',
                videoUrl: data.videoUrl || '',
            }
        };
        
        const lesson = await Lesson.findByIdAndUpdate(id, updateData, { new: true });
        revalidatePath("/admin/lessons");
        revalidatePath(`/admin/lessons/${id}`);
        return { success: true, data: JSON.parse(JSON.stringify(lesson)) };
    } catch (error) {
        console.error("Error updating lesson:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to update lesson" };
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
