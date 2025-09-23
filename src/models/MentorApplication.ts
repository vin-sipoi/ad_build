import { Schema, models, model, Document, Types } from 'mongoose';

// Mentor Application interface and schema
export interface IMentorApplication extends Document {
  userId: Types.ObjectId;
  bio: string;
  expertiseTracks: string[];
  status: 'pending' | 'approved' | 'rejected';
  decidedBy?: Types.ObjectId;
  decidedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MentorApplicationSchema = new Schema<IMentorApplication>({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  bio: { 
    type: String, 
    required: true,
    maxlength: 1000 
  },
  expertiseTracks: { 
    type: [String], 
    required: true,
    enum: ['defi', 'smart-contracts', 'ai', 'web3', 'nfts', 'gamefi']
  },
  status: { 
    type: String, 
    required: true, 
    default: 'pending',
    enum: ['pending', 'approved', 'rejected']
  },
  decidedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  decidedAt: Date,
  rejectionReason: String,
}, { 
  timestamps: true 
});

// Indexes for efficient queries
MentorApplicationSchema.index({ userId: 1, status: 1 });
MentorApplicationSchema.index({ status: 1 });

export const MentorApplication = models.MentorApplication || 
  model<IMentorApplication>('MentorApplication', MentorApplicationSchema);
