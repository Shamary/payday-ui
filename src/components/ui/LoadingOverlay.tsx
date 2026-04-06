'use client';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({ visible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="rounded-2xl bg-white/90 px-8 py-6 shadow-2xl ring-1 ring-black/5">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm font-medium text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
