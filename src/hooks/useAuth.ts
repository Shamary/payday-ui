import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, setUser, fetchUserData } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          await fetchUserData();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          localStorage.clear();
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, [setUser, fetchUserData]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
  };
}
