// Authentication hook
'use client';

import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User } from '@/types';
import { checkAdminClaims } from '@/lib/auth-utils';

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<{ isAdmin: boolean; isSuperAdmin: boolean }>({ isAdmin: false, isSuperAdmin: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Check admin claims
          const adminClaims = await checkAdminClaims(firebaseUser);
          setAdminStatus(adminClaims);
          
          // Fetch user data from MongoDB
          const response = await fetch(`/api/users/${firebaseUser.uid}`);
          if (response.ok) {
            const data = await response.json();
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
        setAdminStatus({ isAdmin: false, isSuperAdmin: false });
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    userData,
    adminStatus,
    loading,
    isAuthenticated: !!user,
    isAdmin: adminStatus.isAdmin,
    isSuperAdmin: adminStatus.isSuperAdmin,
    hasRole: (role: string) => userData?.role === role,
  };
}
