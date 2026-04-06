'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { openCoinbaseWidget } from '@/lib/coinbase';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 36; // 3 minutes

function CoinbaseVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const { fetchUserData } = useAuthStore();

  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isAwaitingWebhook, setIsAwaitingWebhook] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pollAttemptRef = useRef(0);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextPath = useMemo(() => searchParams.get('next') || '/dashboard', [searchParams]);
  const isSignupMode = searchParams.get('mode') === 'signup';

  const clearPollTimer = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const stopWebhookWaiting = useCallback(() => {
    setIsAwaitingWebhook(false);
    clearPollTimer();
  }, []);

  const completeVerification = useCallback(async () => {
    await fetchUserData();
    router.replace(nextPath);
  }, [fetchUserData, nextPath, router]);

  const checkVerificationStatus = useCallback(
    async (requestId: string, continuePolling = false) => {
      try {
        setErrorMessage(null);

        const response = await apiClient.get(`/wallets/coinbase/verification-status/${requestId}`);
        const data = response.data as {
          verified: boolean;
          transactionStatus: 'pending' | 'completed' | 'failed';
          providerStatus?: string;
        };

        if (data.verified && data.transactionStatus === 'completed') {
          setStatusMessage('Verification complete. Redirecting you now...');
          stopWebhookWaiting();
          await completeVerification();
          return;
        }

        if (data.transactionStatus === 'failed') {
          stopWebhookWaiting();
          setErrorMessage('Verification payment was not completed. Please try again.');
          setStatusMessage(null);
          return;
        }

        setStatusMessage('Verification is in progress. We are waiting for Coinbase webhook confirmation.');

        if (continuePolling && pollAttemptRef.current < MAX_POLL_ATTEMPTS) {
          pollAttemptRef.current += 1;
          pollTimerRef.current = setTimeout(() => {
            void checkVerificationStatus(requestId, true);
          }, POLL_INTERVAL_MS);
        } else if (continuePolling) {
          stopWebhookWaiting();
          setStatusMessage('Still pending at Coinbase. We will continue once Coinbase sends confirmation. You can retry starting verification if needed.');
        }
      } catch (error: any) {
        if (!continuePolling) {
          setErrorMessage(error.response?.data?.error || 'Could not check verification status');
          stopWebhookWaiting();
        }
      }
    },
    [completeVerification, stopWebhookWaiting],
  );

  useEffect(() => {
    return () => {
      clearPollTimer();
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace('/auth/login');
      return;
    }

    if (!user.coinbaseWalletAddress) {
      router.replace('/auth/wallet-setup');
      return;
    }

    if (user.coinbaseVerified) {
      router.replace(nextPath);
    }
  }, [isLoading, nextPath, router, user]);

  const handleStartVerification = async () => {
    try {
      setIsStartingSession(true);
      setErrorMessage(null);
      setStatusMessage('Preparing secure Coinbase verification...');
      stopWebhookWaiting();
      pollAttemptRef.current = 0;

      const response = await apiClient.post('/wallets/coinbase/verification-request');
      const data = response.data as { requestId: string; onRampUrl: string };

      setIsAwaitingWebhook(true);
      setStatusMessage('Coinbase secure window opened. Complete the $1 verification and we will update this page automatically.');

      openCoinbaseWidget(data.onRampUrl);
      void checkVerificationStatus(data.requestId, true);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to start Coinbase verification');
      setStatusMessage(null);
      stopWebhookWaiting();
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleSkip = () => {
    router.replace('/dashboard');
  };

  return (
    <div className="container-custom py-10">
      <LoadingOverlay
        visible={isStartingSession || isAwaitingWebhook}
        message={isStartingSession ? 'Preparing secure verification...' : 'Awaiting Coinbase confirmation...'}
      />
      <div className="mx-auto max-w-2xl">
        <div className="card space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">One-Time Security Verification</h1>
            <p className="mt-2 text-gray-600">
              To enable instant Visa/Mastercard purchases, please complete a one-time verification with our payment
              partner, Coinbase.
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            Verification amount: <span className="font-semibold">$2.00 USD</span>
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
          ) : null}

          {statusMessage ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">{statusMessage}</div>
          ) : null}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleStartVerification}
              disabled={isStartingSession || isAwaitingWebhook}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isStartingSession ? 'Starting verification...' : 'Verify with Coinbase'}
            </button>

            {isSignupMode ? (
              <button
                type="button"
                onClick={handleSkip}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Skip for now
              </button>
            ) : null}
          </div>

          <div className="text-sm text-gray-600">
            <p>After verification:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Topup and withdrawal become available instantly</li>
              <li>Your verification status will appear in Settings</li>
              <li>You can complete verification later from Settings if you skip now</li>
              <li>Status is set automatically from Coinbase webhook confirmations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoinbaseVerificationPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-10">
          <div className="mx-auto max-w-2xl">
            <div className="card">
              <h1 className="text-3xl font-bold text-gray-900">One-Time Security Verification</h1>
              <p className="mt-2 text-gray-600">Loading verification details...</p>
            </div>
          </div>
        </div>
      }
    >
      <CoinbaseVerificationContent />
    </Suspense>
  );
}
