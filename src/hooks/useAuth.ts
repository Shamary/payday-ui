import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

interface DecodedUser {
  sub: string;
  preferred_username: string;
  email: string;
  given_name?: string;
  family_name?: string;
}

export function useAuth() {
  const { user, setUser, fetchUserData } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      
      if (token) {
        try {
          // Decode token to get basic info
          const parts = token.split('.');
          if (parts.length === 3) {
            const decoded = JSON.parse(atob(parts[1]));
            setUser({
              sub: decoded.sub,
              preferred_username: decoded.preferred_username,
              email: decoded.email,
              given_name: decoded.given_name,
              family_name: decoded.family_name,
            });
          }
          
          // Fetch full user data
          await fetchUserData();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          localStorage.clear();
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
  };
}
