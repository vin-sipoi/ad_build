import { Schema, models, model, Document, Types } from 'mongoose';

// Progress interface and schema
export interface IProgress extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  topicId: Types.ObjectId;
  lessonId: Types.ObjectId;
  status: 'not-started' | 'in-progress' | 'completed';
  startedAt?: Date;
  completedAt?: Date;
  timeSpentSeconds: number;
  quizScore?: number;
  score?: number; // legacy alias
  quizPassed?: boolean;
  quizAttempts: number;
  lastAttemptAt?: Date;
  quizResponses?: Array<{
    question: string;
    selectedOption: number | null;
    isCorrect: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema = new Schema<IProgress>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true,
    index: true 
  },
  topicId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Topic', 
    required: true 
  },
  lessonId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Lesson', 
    required: true,
    index: true 
  },
  status: { 
    type: String, 
    required: true, 
    default: 'not-started',
    enum: ['not-started', 'in-progress', 'completed']
  },
  startedAt: Date,
  completedAt: Date,
  timeSpentSeconds: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  quizScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  quizPassed: {
    type: Boolean,
    default: false,
  },
  quizAttempts: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastAttemptAt: {
    type: Date,
  },
  quizResponses: [
    {
      question: { type: String, required: true },
      selectedOption: { type: Number },
      isCorrect: { type: Boolean, required: true },
    }
  ],
}, { 
  timestamps: true 
});

// Unique constraint and compound indexes
ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
ProgressSchema.index({ userId: 1, courseId: 1 });
ProgressSchema.index({ status: 1 });

export const Progress = models.Progress || model<IProgress>('Progress', ProgressSchema);
