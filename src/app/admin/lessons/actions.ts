"use server";

import { dbConnect } from "@/lib/db";
import { Lesson } from "@/models/Lesson";
import { Topic } from "@/models/Topic";
import "@/models/Course"; // Register Course model for Mongoose schema
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
        
        // Get topics with course information (both draft and published for admin)
        const topics = await Topic.find({})
            .populate('courseId', 'title')
            .lean();
        
        console.log('getAllTopics: Raw topics found:', topics.length);
        console.log('getAllTopics: All topics:', topics.map(t => ({ 
            _id: t._id, 
            title: t.title, 
            courseId: t.courseId,
            status: (t as Record<string, unknown>).status 
        })));
        
        // Filter out topics without valid courseId
        const validTopics = topics.filter(topic => {
            const hasValidCourseId = topic.courseId && (topic.courseId as Record<string, unknown>)?.title;
            if (!hasValidCourseId) {
                console.log('getAllTopics: Filtering out topic without courseId:', { 
                    _id: topic._id, 
                    title: topic.title, 
                    courseId: topic.courseId 
                });
            }
            return hasValidCourseId;
        });
        console.log('getAllTopics: Valid topics (with courseId):', validTopics.length);
        

        
        // Convert to the expected format for LessonForm
        const serializedTopics = validTopics.map((topic: Record<string, unknown>) => ({
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
        console.log('📝 createLesson: Starting...');
        await dbConnect();
        
        // Log database connection info
        const mongoose = await import('mongoose');
        console.log('📊 Database:', mongoose.default.connection.db?.databaseName);
        console.log('🔗 Connection state:', mongoose.default.connection.readyState);
        
        // Get the topic to find the courseId
        const topic = await Topic.findById(data.topicId);
        if (!topic) {
            return { success: false, error: "Selected topic not found" };
        }
        
        const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
    const normalizedType = data.type === 'reading' ? 'article' : data.type;
    const quiz = normalizedType === 'quiz' ? data.quiz : undefined;
        
        // Transform the data to match the Mongoose model
        const lessonData = {
            slug,
            courseId: topic.courseId, // Add the courseId from the topic
      title: data.title,
      description: data.description,
      topicId: data.topicId,
      type: normalizedType,
      difficulty: data.difficulty,
      estimatedMinutes: data.estimatedMinutes,
      order: data.order,
      status: data.status,
      content: {
        html: normalizedType === 'article' ? data.content || '' : '',
      },
      videoUrl: normalizedType === 'video' ? data.videoUrl || '' : '',
      quiz,
      resources: data.resources || [],
      creditsAwarded: data.creditsAwarded,
      createdBy: "60d21b4667d0d8992e610c85"
        };
        
        console.log('📦 Prepared lesson data:', {
          title: lessonData.title,
          slug: lessonData.slug,
          type: lessonData.type,
          collection: Lesson.collection.name
        });
        
        const lesson = new Lesson(lessonData);
        console.log('💾 Saving to collection:', lesson.collection.name);
        
        await lesson.save();
        console.log('✅ Lesson saved with ID:', lesson._id);
        console.log('📍 Collection:', lesson.collection.name);
        console.log('📊 Database:', mongoose.connection.db?.databaseName);
        
        revalidatePath("/admin/lessons");
        return { success: true, data: JSON.parse(JSON.stringify(lesson)) };
    } catch (error) {
        console.error("❌ Error creating lesson:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to create lesson" };
    }
}

export async function updateLesson(id: string, data: Partial<ILesson>) {
    try {
        await dbConnect();
        const slug = data.title?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
    const normalizedType = data.type === 'reading' ? 'article' : data.type;
    const quiz = normalizedType === 'quiz' ? data.quiz : undefined;
        
    // Transform the data to match the Mongoose model
    const updateData: Record<string, unknown> = {};

    if (slug) updateData.slug = slug;
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.topicId) updateData.topicId = data.topicId;
    if (data.difficulty) updateData.difficulty = data.difficulty;
    if (typeof data.estimatedMinutes === 'number') updateData.estimatedMinutes = data.estimatedMinutes;
    if (typeof data.order === 'number') updateData.order = data.order;
    if (data.status) updateData.status = data.status;
    if (data.resources) updateData.resources = data.resources;
    if (data.creditsAwarded !== undefined) updateData.creditsAwarded = data.creditsAwarded;

    if (normalizedType) {
      updateData.type = normalizedType;
    }

    if (data.content !== undefined || normalizedType === 'article') {
      updateData.content = {
        html: normalizedType === 'article' ? data.content || '' : '',
      };
    }

    if (data.videoUrl !== undefined || normalizedType === 'video') {
      updateData.videoUrl = normalizedType === 'video' ? data.videoUrl || '' : '';
    }

    if (quiz !== undefined) {
      updateData.quiz = quiz;
    } else if (normalizedType && normalizedType !== 'quiz') {
      updateData.quiz = undefined;
    }
        
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
