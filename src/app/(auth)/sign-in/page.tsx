'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user has admin claims
      const idTokenResult = await userCredential.user.getIdTokenResult(true);
      const isAdmin = !!idTokenResult.claims.admin;
      
      if (isAdmin) {
        // For admin users, create admin session
        const idToken = await userCredential.user.getIdToken();
        
        const response = await fetch('/api/admin/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        if (response.ok) {
          // Redirect to admin panel
          router.push('/admin');
        } else {
          const data = await response.json();
          setError(data.message || 'Admin access denied');
        }
      } else {
        // Regular users go to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'github') => {
    const authProvider = provider === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    setLoading(true);
    
    try {
      const userCredential = await signInWithPopup(auth, authProvider);
      
      // Check if user has admin claims
      const idTokenResult = await userCredential.user.getIdTokenResult(true);
      const isAdmin = !!idTokenResult.claims.admin;
      
      if (isAdmin) {
        // For admin users, create admin session
        const idToken = await userCredential.user.getIdToken();
        
        const response = await fetch('/api/admin/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        if (response.ok) {
          // Redirect to admin panel
          router.push('/admin');
        } else {
          const data = await response.json();
          setError(data.message || 'Admin access denied');
        }
      } else {
        // Regular users go to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-6 md:p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <Image src="/Adamur_White_BG.png" alt="Adamur Logo" width={100} height={100} className="mx-auto mb-4" style={{ width: "auto", height: "auto" }} />
          <p className="text-base md:text-lg font-medium text-gray-700 leading-tight">Adamur Builder Residency & Engineering Lab</p>
          <p className="text-xs md:text-sm text-gray-500 mb-4">Virtual Accelerator (AI + Web3 Infra)</p>
          <h1 className="text-2xl md:text-3xl font-bold">Sign In</h1>
          <p className="text-gray-500 text-sm md:text-base">Access your dashboard</p>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">Or continue with</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSocialSignIn('google')}
            disabled={loading}
            className="w-full px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Google'}
          </button>
          <button
            onClick={() => handleSocialSignIn('github')}
            disabled={loading}
            className="w-full px-4 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'GitHub'}
          </button>
        </div>
        <p className="text-sm text-center text-gray-500">
          Don&apos;t have an account?{' '}
          <Link href="/sign-up" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
