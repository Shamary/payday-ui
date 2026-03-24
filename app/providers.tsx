'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
