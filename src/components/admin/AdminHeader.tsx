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
  } | null;
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
      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8">
        <div className="flex justify-between items-center py-3 md:py-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white truncate">
              Admin Panel
            </h1>
            {user && (
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 truncate">
                Welcome, {user.name}
                {user.superAdmin && (
                  <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 md:px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    Super Admin
                  </span>
                )}
                {user.admin && !user.superAdmin && (
                  <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 md:px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Admin
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-4">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <User className="h-3 w-3 md:h-4 md:w-4" />
                <span className="truncate max-w-[120px] md:max-w-none">{user.email}</span>
              </div>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs md:text-sm"
            >
              <LogOut className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
