'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.push('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container-custom py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-500">
          💰 Payday
        </Link>

        <div className="flex gap-4 items-center">
          {isAuthenticated && user ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-500">
                Dashboard
              </Link>
              <Link href="/send" className="text-gray-600 hover:text-blue-500">
                Send
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-blue-500">
                Settings
              </Link>
              {user.role === 'ADMIN' ? (
                <Link href="/admin" className="text-gray-600 hover:text-blue-500">
                  Admin
                </Link>
              ) : null}
              <span className="text-gray-600">
                {user.firstName || user.username}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-blue-500">
                Sign In
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
