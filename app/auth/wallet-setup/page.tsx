'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser, useEvmAddress, useIsSignedIn, useSignInWithEmail, useVerifyEmailOTP } from '@coinbase/cdp-hooks';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { clearPendingSignup, getPendingSignup, storeAuthTokens } from '@/lib/auth';

const COINBASE_PROJECT_ID = process.env.NEXT_PUBLIC_CDP_PROJECT_ID || '';

function WalletSetupFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const { fetchUserData } = useAuthStore();
  const { signInWithEmail } = useSignInWithEmail();
  const { verifyEmailOTP } = useVerifyEmailOTP();
  const { currentUser } = useCurrentUser();
  const { evmAddress } = useEvmAddress();
  const { isSignedIn } = useIsSignedIn();

  const [flowId, setFlowId] = useState<string | null>(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const [autoOtpRequested, setAutoOtpRequested] = useState(false);
  const [otp, setOtp] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [linkingWallet, setLinkingWallet] = useState(false);
  const [walletLinked, setWalletLinked] = useState(false);
  const [signupBootstrapping, setSignupBootstrapping] = useState(true);
  const [pendingSignupEmail, setPendingSignupEmail] = useState<string | null>(null);
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0);
  const isMountedRef = useRef(false);
  const isFinalizingRef = useRef(false);

  const isSignupMode = searchParams.get('mode') === 'signup';

  const getFlowIdFromResponse = (response: any): string | null => {
    return (
      response?.flowId ||
      response?.flow_id ||
      response?.data?.flowId ||
      response?.data?.flow_id ||
      response?.id ||
      response?.data?.id ||
      null
    );
  };

  const startResendCooldown = () => {
    setResendCooldownSeconds(20);
  };

  const withTimeout = async <T,>(promise: Promise<T>, ms: number, timeoutMessage: string): Promise<T> => {
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, ms);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (resendCooldownSeconds <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendCooldownSeconds((current) => current - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [resendCooldownSeconds]);

  useEffect(() => {
    if (!isSignupMode) {
      setSignupBootstrapping(false);
      setPendingSignupEmail(null);
      return;
    }

    const pendingSignup = getPendingSignup();
    setPendingSignupEmail(pendingSignup?.email || null);
    setSignupBootstrapping(false);
  }, [isSignupMode]);

  useEffect(() => {
    if (signupBootstrapping) {
      return;
    }

    if (isSignupMode && !pendingSignupEmail) {
      setErrorMessage('Signup session expired. Please create your account again.');
      router.replace('/auth/register');
      return;
    }

    if (!isSignupMode && !isLoading && !user) {
      router.replace('/auth/login');
      return;
    }

    if (!isSignupMode && !isLoading && user?.coinbaseWalletAddress) {
      router.replace('/dashboard');
    }
  }, [isLoading, isSignupMode, pendingSignupEmail, router, signupBootstrapping, user]);

  useEffect(() => {
    if (!isSignupMode || !pendingSignupEmail || flowId || isSignedIn || linkingWallet || autoOtpRequested) {
      return;
    }

    const startOtpFlow = async () => {
      try {
        setAutoOtpRequested(true);
        setOtpRequested(true);
        setIsSendingCode(true);
        setErrorMessage(null);
        setStatusMessage(`Sending a Coinbase verification code to ${pendingSignupEmail}...`);

        const response = await withTimeout(
          signInWithEmail({ email: pendingSignupEmail }),
          15000,
          'Sending code is taking too long. Please use resend to try again.'
        );

        const extractedFlowId = getFlowIdFromResponse(response);
        if (isMountedRef.current) {
          setFlowId(extractedFlowId);
          startResendCooldown();
          setStatusMessage('Verification code sent. Enter the code to continue your signup.');
          if (!extractedFlowId) {
            setErrorMessage('We sent the code, but could not start verification. Click "Resend code" below and try again.');
          }
        }
      } catch (error: any) {
        if (isMountedRef.current) {
          setErrorMessage(error.message || 'Failed to send verification code');
          setStatusMessage(null);
        }
      } finally {
        if (isMountedRef.current) {
          setIsSendingCode(false);
        }
      }
    };

    void startOtpFlow();
  }, [autoOtpRequested, flowId, isSignedIn, isSignupMode, linkingWallet, pendingSignupEmail, signInWithEmail]);

  const finalizeWalletSetup = async (coinbaseUserId?: string, coinbaseWalletAddress?: string) => {
    if (isFinalizingRef.current || walletLinked) {
      return;
    }

    isFinalizingRef.current = true;

    try {
      setLinkingWallet(true);
      setErrorMessage(null);
      setStatusMessage(isSignupMode ? 'Creating your Payday account and linking your wallet...' : 'Linking your Coinbase wallet to Payday...');

      if (isSignupMode) {
        const pendingSignup = getPendingSignup();
        if (!pendingSignup) {
          throw new Error('Signup session expired. Please create your account again.');
        }

        await apiClient.post('/auth/register', {
          email: pendingSignup.email,
          username: pendingSignup.username,
          password: pendingSignup.password,
          firstName: pendingSignup.firstName,
          lastName: pendingSignup.lastName,
          preferredCurrency: pendingSignup.preferredCurrency,
        });

        const loginResponse = await apiClient.post('/auth/login', {
          username: pendingSignup.email,
          password: pendingSignup.password,
        });

        storeAuthTokens(loginResponse.data.access_token, loginResponse.data.refresh_token);
      }

      const resolvedCoinbaseUserId = coinbaseUserId || currentUser?.userId;
      const resolvedWalletAddress = coinbaseWalletAddress || evmAddress;

      if (!resolvedCoinbaseUserId) {
        throw new Error('Coinbase account ID was not returned after verification. Please resend code and try again.');
      }

      await apiClient.put('/users/me', {
        coinbaseWalletAddress: resolvedWalletAddress,
        coinbaseWalletId: resolvedCoinbaseUserId,
      });

      await fetchUserData();
      if (isSignupMode) {
        clearPendingSignup();
      }

      setWalletLinked(true);
      setStatusMessage('Wallet linked successfully. Redirecting to your dashboard...');
      toast.success('Account created');
      router.replace('/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Failed to finalize wallet setup';
      setErrorMessage(message);
      setStatusMessage(null);
      toast.error(message);
      throw error;
    } finally {
      setLinkingWallet(false);
      isFinalizingRef.current = false;
    }
  };

  const handleSendCode = async () => {
    const walletEmail = isSignupMode ? pendingSignupEmail : user?.email;
    if (!walletEmail) {
      setErrorMessage(isSignupMode ? 'Signup session expired. Please create your account again.' : 'Your account email is not available. Please sign in again.');
      return;
    }

    try {
      setOtpRequested(true);
      setIsSendingCode(true);
      setErrorMessage(null);
      setStatusMessage(`Sending a Coinbase verification code to ${walletEmail}...`);

      const response = await withTimeout(
        signInWithEmail({ email: walletEmail }),
        15000,
        'Sending code is taking too long. Please try again in a moment.'
      );
      const extractedFlowId = getFlowIdFromResponse(response);
      setFlowId(extractedFlowId);
      startResendCooldown();
      setStatusMessage('Verification code sent. Enter the code to create and link your wallet.');
      if (!extractedFlowId) {
        setErrorMessage('Code was sent, but verification session is missing. Please resend and try again.');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to send verification code');
      setStatusMessage(null);
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!flowId || !otp) {
      setErrorMessage('Enter the verification code Coinbase sent to your email.');
      return;
    }

    try {
      setIsVerifyingCode(true);
      setErrorMessage(null);
      setStatusMessage('Verifying code and creating your Coinbase embedded wallet...');
      const verifyResult = await withTimeout(
        verifyEmailOTP({ flowId, otp }),
        30000,
        'Verification is taking too long. Please retry or resend a new code.'
      );

      setStatusMessage('Verification complete. Finalizing your wallet setup...');

      const verifiedUserId = verifyResult?.user?.userId;
      const verifiedWalletAddress = verifyResult?.user?.evmAccounts?.[0];
      await finalizeWalletSetup(verifiedUserId, verifiedWalletAddress);
    } catch (error: any) {
      const message = error.message || 'Failed to verify code';
      setErrorMessage(message);
      setStatusMessage(null);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  if (!COINBASE_PROJECT_ID) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="card max-w-lg text-center">
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Coinbase wallet setup unavailable</h1>
          <p className="text-gray-600">
            Set NEXT_PUBLIC_CDP_PROJECT_ID in the UI environment to enable Coinbase Embedded Wallet setup.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="card w-full max-w-lg">
        <h1 className="mb-3 text-3xl font-bold text-center">Finish Wallet Setup</h1>
        <p className="mb-6 text-center text-gray-600">
          Verify your email with Coinbase to create your embedded wallet for USDC on Base.
        </p>

        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Wallet email: <span className="font-semibold">{(isSignupMode ? pendingSignupEmail : user?.email) || 'loading...'}</span>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {statusMessage}
          </div>
        ) : null}

        {!otpRequested ? (
          <button
            type="button"
            onClick={handleSendCode}
            disabled={isSendingCode || linkingWallet}
            className="w-full btn-primary disabled:opacity-50"
          >
            {isSendingCode ? 'Sending code...' : 'Send Coinbase verification code'}
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Verification code</label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input-field"
                placeholder="Enter the code from your email"
              />
            </div>

            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={isVerifyingCode || linkingWallet || !flowId || !otp.trim()}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isVerifyingCode ? 'Verifying...' : !flowId ? 'Waiting for verification session...' : 'Verify code and create wallet'}
            </button>

            <button
              type="button"
              onClick={handleSendCode}
              disabled={isSendingCode || linkingWallet || resendCooldownSeconds > 0}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isSendingCode
                ? 'Resending...'
                : resendCooldownSeconds > 0
                ? `Resend code in ${resendCooldownSeconds}s`
                : 'Resend code'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WalletSetupPage() {
  if (!COINBASE_PROJECT_ID) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="card max-w-lg text-center">
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Coinbase wallet setup unavailable</h1>
          <p className="text-gray-600">
            Set NEXT_PUBLIC_CDP_PROJECT_ID in the UI environment to enable Coinbase Embedded Wallet setup.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <WalletSetupFlow />
    </Suspense>
  );
}