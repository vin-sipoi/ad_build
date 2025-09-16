import { ObjectId } from 'mongodb';

export default interface User {
  name: string;
  email: string;
  image?: string;
  emailVerified?: Date;
  role: 'founder' | 'user';
  _id?: ObjectId;
}
