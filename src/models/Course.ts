import { Schema, models, model, Document, Types } from 'mongoose';

// Course interface and schema
export interface ICourse extends Document {
  title: string;
  slug: string;
  track: 'beginner' | 'intermediate' | 'advanced';
  credits: number;
  estimatedHours: number;
  order: number;
  status: 'draft' | 'published';
  description: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  title: { 
    type: String, 
    required: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  track: { 
    type: String, 
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  credits: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  estimatedHours: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  order: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  status: { 
    type: String, 
    required: true, 
    default: 'draft',
    enum: ['draft', 'published']
  },
  description: { 
    type: String, 
    required: true 
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  thumbnail: String,
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
}, { 
  timestamps: true 
});

// Index for efficient queries
CourseSchema.index({ track: 1, status: 1 });
CourseSchema.index({ order: 1 });

export const Course = models.Course || model<ICourse>('Course', CourseSchema);
