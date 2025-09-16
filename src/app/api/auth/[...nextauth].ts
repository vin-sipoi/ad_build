import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import User from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { email, name, image, provider } = req.body;
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB);
      const usersCollection = db.collection<User>('users');

      let user = await usersCollection.findOne({ email });

      if (!user) {
        const newUser: User = {
          email,
          name,
          image,
          role: 'founder', // Default role for new sign-ups
          emailVerified: new Date(),
        };
        const result = await usersCollection.insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
      }

      res.status(200).json({ message: 'User authenticated successfully', user });
    } catch (error) {
      console.error('Error during authentication:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
