"use server";

import { dbConnect } from "@/lib/db";
import { Topic } from "@/models/Topic";
import { Course } from "@/models/Course";
import { ITopic } from "../types";
import { revalidatePath } from "next/cache";
import { mockTopics, mockCourses } from "@/lib/mockData";
import mongoose from "mongoose";

export async function getTopics(options: {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
}) {
  try {
    await dbConnect();

    const { page = 1, limit = 10, search = '', courseId = '' } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }
    if (courseId && courseId !== 'all') {
      filter.courseId = courseId;
    }

    const [topics, total] = await Promise.all([
      Topic.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'lessons',
            localField: '_id',
            foreignField: 'topicId',
            as: 'lessons'
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'courseId'
          }
        },
        {
          $addFields: {
            lessonCount: { $size: '$lessons' },
            courseId: { $arrayElemAt: ['$courseId', 0] }
          }
        },
        { $sort: { order: 1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            title: 1,
            summary: 1,
            courseId: { _id: 1, title: 1 },
            estimatedMinutes: 1,
            order: 1,
            status: 1,
            slug: 1,
            lessonCount: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      ]),
      Topic.countDocuments(filter),
    ]);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(topics)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching topics:', error);

    // Fallback to mock data
    const { page = 1, limit = 10, search = '', courseId = '' } = options;
    let filteredTopics = mockTopics;

    if (search) {
      filteredTopics = mockTopics.filter(topic =>
        topic.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (courseId && courseId !== 'all') {
      filteredTopics = filteredTopics.filter(topic => topic.courseId === courseId);
    }

    const total = filteredTopics.length;
    const skip = (page - 1) * limit;
    const paginatedTopics = filteredTopics.slice(skip, skip + limit);

    return {
      success: true,
      data: paginatedTopics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export async function getAllCourses() {
    try {
        await dbConnect();
        const courses = await Course.find({}, 'title');
        return { success: true, data: JSON.parse(JSON.stringify(courses)) };
    } catch (error) {
        console.error('Error fetching courses:', error);
        return { success: true, data: mockCourses.map(c => ({ _id: c._id, title: c.title })) };
    }
}

export async function createTopic(data: Omit<ITopic, '_id' | 'createdAt' | 'updatedAt'>) {
    try {
        await dbConnect();
        const slug = data.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        // TODO: Replace with actual authenticated user ID
        const userId = new mongoose.Types.ObjectId("507f1f77bcf86cd799439011");
        const courseId = new mongoose.Types.ObjectId(data.courseId.toString());
        const topic = new Topic({
            ...data,
            slug,
            courseId,
            createdBy: userId
        });
        await topic.save();
        revalidatePath("/admin/topics");
        return { success: true, data: JSON.parse(JSON.stringify(topic)) };
    } catch (error) {
        console.error("Error creating topic:", error);
        return { success: false, error: "Failed to create topic" };
    }
}

export async function updateTopic(id: string, data: Partial<ITopic>) {
    try {
        await dbConnect();
        const slug = data.title?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
        const topic = await Topic.findByIdAndUpdate(id, { ...data, slug }, { new: true });
        revalidatePath("/admin/topics");
        revalidatePath(`/admin/topics/${id}`);
        return { success: true, data: JSON.parse(JSON.stringify(topic)) };
    } catch (error) {
        console.error("Error updating topic:", error);
        return { success: false, error: "Failed to update topic" };
    }
}

export async function getTopicById(id: string) {
    try {
        await dbConnect();
        const topic = await Topic.findById(id).populate('courseId', 'title');
        if (!topic) {
            return { success: false, error: "Topic not found" };
        }
        return { success: true, data: JSON.parse(JSON.stringify(topic)) };
    } catch (error) {
        console.error(`Error fetching topic ${id}:`, error);
        return { success: false, error: "Failed to fetch topic" };
    }
}

export async function deleteTopic(id: string) {
    try {
        await dbConnect();
        const topic = await Topic.findByIdAndDelete(id);
        if (!topic) {
            return { success: false, error: "Topic not found" };
        }
        revalidatePath("/admin/topics");
        return { success: true, data: JSON.parse(JSON.stringify(topic)) };
    } catch (error) {
        console.error(`Error deleting topic ${id}:`, error);
        return { success: false, error: "Failed to delete topic" };
    }
}
