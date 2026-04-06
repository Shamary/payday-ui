'use client';

import { useEffect, useMemo, useState } from 'react';

interface CoinbaseOpenDetail {
  url: string;
}

export default function CoinbaseModalHost() {
  const [isOpen, setIsOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(false);

  const title = useMemo(() => {
    if (!url) {
      return 'Coinbase';
    }

    if (url.includes('/sell')) {
      return 'Coinbase Withdrawal';
    }

    return 'Coinbase Checkout';
  }, [url]);

  useEffect(() => {
    (window as any).__paydayCoinbaseModalHost = true;

    const onOpen = (event: Event) => {
      const customEvent = event as CustomEvent<CoinbaseOpenDetail>;
      const nextUrl = customEvent.detail?.url;

      if (!nextUrl) {
        return;
      }

      setUrl(nextUrl);
      setIframeLoading(true);
      setIsOpen(true);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('coinbase:open-modal', onOpen as EventListener);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      (window as any).__paydayCoinbaseModalHost = false;
      window.removeEventListener('coinbase:open-modal', onOpen as EventListener);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  if (!isOpen || !url) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm">
      <div className="relative h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <button
            type="button"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>

        <div className="relative h-[calc(92vh-53px)]">
          {iframeLoading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
                <p className="text-sm text-gray-700">Loading Coinbase secure checkout...</p>
              </div>
            </div>
          ) : null}

          <iframe
            title="Coinbase Modal"
            src={url}
            className="h-full w-full"
            onLoad={() => setIframeLoading(false)}
            allow="clipboard-read; clipboard-write"
          />
        </div>
      </div>
    </div>
  );
}
