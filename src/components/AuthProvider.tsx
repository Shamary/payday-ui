'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/google/callback'];

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.includes(pathname);

      if (!isAuthenticated && !isPublicRoute) {
        router.push('/auth/login');
      } else if (isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/register')) {
        router.push('/dashboard');
      } else if (pathname.startsWith('/admin') && user?.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  return <>{children}</>;
}
