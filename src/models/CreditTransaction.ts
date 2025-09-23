import { Schema, models, model, Document, Types } from 'mongoose';

// Credit Transaction interface and schema
export interface ICreditTransaction extends Document {
  userId: Types.ObjectId;
  source: 'course-completion' | 'lesson' | 'manual' | 'bonus';
  refId?: Types.ObjectId; // lessonId/courseId reference
  amount: number;
  note?: string;
  createdBy?: Types.ObjectId; // for manual transactions
  createdAt: Date;
  updatedAt: Date;
}

const CreditTransactionSchema = new Schema<ICreditTransaction>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  source: { 
    type: String, 
    required: true,
    enum: ['course-completion', 'lesson', 'manual', 'bonus']
  },
  refId: { 
    type: Schema.Types.ObjectId,
    index: true
  },
  amount: { 
    type: Number, 
    required: true
  },
  note: String,
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
}, { 
  timestamps: true 
});

// Indexes for efficient queries
CreditTransactionSchema.index({ userId: 1, createdAt: -1 });
CreditTransactionSchema.index({ source: 1 });

export const CreditTransaction = models.CreditTransaction || 
  model<ICreditTransaction>('CreditTransaction', CreditTransactionSchema);
