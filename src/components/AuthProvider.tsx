'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getPostAuthRedirectPath } from '@/lib/auth';

const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/google/callback'];

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const isWalletSetupRoute = pathname.startsWith('/auth/wallet-setup');
      const isVerificationRoute = pathname.startsWith('/auth/coinbase-verification');
      const isPublicRoute = isWalletSetupRoute || isVerificationRoute || publicRoutes.includes(pathname);

      if (!isAuthenticated && !isPublicRoute) {
        router.push('/auth/login');
      } else if (isAuthenticated && (pathname === '/auth/login' || pathname === '/auth/register')) {
        router.push(getPostAuthRedirectPath(user || undefined));
      } else if (pathname.startsWith('/admin') && user?.role !== 'ADMIN') {
        router.push('/dashboard');
      } else if (
        isAuthenticated &&
        !user?.coinbaseVerified &&
        (pathname.startsWith('/wallet/topup') || pathname.startsWith('/wallet/withdraw'))
      ) {
        router.push(`/auth/coinbase-verification?next=${encodeURIComponent(pathname)}`);
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  return <>{children}</>;
}
