'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';
import CoinbaseEmbeddedWalletProvider from '@/components/CoinbaseEmbeddedWalletProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CoinbaseEmbeddedWalletProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
          }}
        />
      </AuthProvider>
    </CoinbaseEmbeddedWalletProvider>
  );
}
