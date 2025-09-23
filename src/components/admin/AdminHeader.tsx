'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AdminHeaderProps {
  user?: {
    email: string;
    name: string;
    admin: boolean;
    superAdmin: boolean;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Sign out from Firebase Auth
      await signOut(auth);
      
      // Call logout API to clear session cookie
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });
      
      // Redirect to login page
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Admin Panel
            </h1>
            {user && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Welcome, {user.name}
                {user.superAdmin && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Super Admin
                  </span>
                )}
                {user.admin && !user.superAdmin && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Admin
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User className="h-4 w-4" />
                {user.email}
              </div>
            )}
            <Button 
              variant="outline" 
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
