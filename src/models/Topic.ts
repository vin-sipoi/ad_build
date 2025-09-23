import { Schema, models, model, Document, Types } from 'mongoose';

// Topic interface and schema
export interface ITopic extends Document {
  courseId: Types.ObjectId;
  title: string;
  order: number;
  summary: string;
  estimatedMinutes: number;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>({
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
  order: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  summary: { 
    type: String, 
    required: true 
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

// Compound index for efficient queries
TopicSchema.index({ courseId: 1, order: 1 });

export const Topic = models.Topic || model<ITopic>('Topic', TopicSchema);
