import { Schema, models, model, Document, Types } from 'mongoose';

// Lesson interface and schema
export interface ILessonQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface ILessonQuiz {
  passingScore: number;
  questions: ILessonQuizQuestion[];
}

export interface ILessonResource {
  title: string;
  url: string;
  type: string;
}

export interface ILesson extends Document {
  topicId: Types.ObjectId;
  courseId: Types.ObjectId; // redundant for faster lookups
  title: string;
  description?: string;
  slug: string;
  type: 'video' | 'article' | 'quiz' | 'task';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: {
    html?: string;
  };
  videoUrl?: string;
  quiz?: ILessonQuiz;
  resources?: ILessonResource[];
  order: number;
  creditsAwarded?: number;
  estimatedMinutes: number;
  status: 'draft' | 'published';
  isActive: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
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
  description: {
    type: String,
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  type: { 
    type: String, 
    required: true,
    enum: ['video', 'article', 'quiz', 'task']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  content: {
    html: String,
  },
  videoUrl: {
    type: String,
  },
  quiz: {
    passingScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true, min: 0 },
        explanation: { type: String },
      }
    ],
  },
  resources: [
    {
      title: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, required: true },
    }
  ],
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
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { 
  timestamps: true 
});

// Compound indexes for efficient queries
LessonSchema.index({ topicId: 1, order: 1 });
LessonSchema.index({ courseId: 1, status: 1 });

export const Lesson = models.Lesson || model<ILesson>('Lesson', LessonSchema);
