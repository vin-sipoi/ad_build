import { Schema, models, model, Document, Types } from 'mongoose';

// Lesson interface and schema
export interface ILesson extends Document {
  topicId: Types.ObjectId;
  courseId: Types.ObjectId; // redundant for faster lookups
  title: string;
  type: 'video' | 'article' | 'quiz' | 'task';
  content: {
    html?: string;
    videoUrl?: string;
    quiz?: Record<string, unknown>;
  };
  order: number;
  creditsAwarded?: number;
  estimatedMinutes: number;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  topicId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Topic', 
    required: true,
    index: true 
  },
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true,
    index: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['video', 'article', 'quiz', 'task']
  },
  content: {
    html: String,
    videoUrl: String,
    quiz: Schema.Types.Mixed,
  },
  order: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  creditsAwarded: { 
    type: Number, 
    min: 0 
  },
  estimatedMinutes: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  status: { 
    type: String, 
    required: true, 
    default: 'draft',
    enum: ['draft', 'published']
  },
}, { 
  timestamps: true 
});

// Compound indexes for efficient queries
LessonSchema.index({ topicId: 1, order: 1 });
LessonSchema.index({ courseId: 1, status: 1 });

export const Lesson = models.Lesson || model<ILesson>('Lesson', LessonSchema);
