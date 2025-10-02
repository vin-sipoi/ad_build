import { Schema, Document, model, models } from 'mongoose';

// User interface and schema
export interface IUser extends Document {
  email: string;
  name: string;
  roles: string[];
  profile: {
    avatarUrl?: string;
    bio?: string;
  };
  myPath: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true,
    lowercase: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  roles: { 
    type: [String], 
    default: ['learner'],
    enum: ['learner', 'mentor', 'admin']
  },
  profile: {
    avatarUrl: String,
    bio: String,
  },
  myPath: {
    type: [String],
    default: [],
  },
}, { 
  timestamps: true 
});

export const User = models.User || model<IUser>('User', UserSchema);

// Legacy interface for backward compatibility
export default interface UserLegacy {
  name: string;
  email: string;
  image?: string;
  emailVerified?: Date;
  role: 'founder' | 'user';
  _id?: string;
}
