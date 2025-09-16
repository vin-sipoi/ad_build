'use client';

import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/sign-in');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 text-center bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
        <p className="text-gray-500">You are successfully logged in.</p>
        <button
          onClick={handleSignOut}
          className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
