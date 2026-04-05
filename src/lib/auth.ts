const COINBASE_PROJECT_ID = process.env.NEXT_PUBLIC_CDP_PROJECT_ID || '';

export interface PendingSignupData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  preferredCurrency: 'JMD' | 'USD';
}

const PENDING_SIGNUP_KEY = 'pending_signup';

export function storeAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

export function storePendingSignup(data: PendingSignupData) {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify(data));
}

export function getPendingSignup(): PendingSignupData | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = sessionStorage.getItem(PENDING_SIGNUP_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PendingSignupData;
  } catch {
    sessionStorage.removeItem(PENDING_SIGNUP_KEY);
    return null;
  }
}

export function clearPendingSignup() {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(PENDING_SIGNUP_KEY);
}

export function getPostAuthRedirectPath(user?: { coinbaseWalletAddress?: string | null }) {
  if (!COINBASE_PROJECT_ID) {
    return '/dashboard';
  }

  return user?.coinbaseWalletAddress ? '/dashboard' : '/auth/wallet-setup';
}