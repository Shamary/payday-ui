'use client';

import { ReactNode } from 'react';
import { CDPReactProvider, type Config } from '@coinbase/cdp-react';

const COINBASE_PROJECT_ID = process.env.NEXT_PUBLIC_CDP_PROJECT_ID || '';

const config: Config = {
  projectId: COINBASE_PROJECT_ID,
  appName: 'Payday',
  authMethods: ['email'],
  ethereum: {
    createOnLogin: 'eoa',
  },
};

export function isCoinbaseEmbeddedWalletEnabled() {
  return Boolean(COINBASE_PROJECT_ID);
}

export default function CoinbaseEmbeddedWalletProvider({ children }: { children: ReactNode }) {
  if (!COINBASE_PROJECT_ID) {
    return <>{children}</>;
  }

  return <CDPReactProvider config={config}>{children}</CDPReactProvider>;
}