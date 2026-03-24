import { create } from 'zustand';
import { apiClient } from '@/lib/api';

interface User {
  sub: string;
  preferred_username: string;
  email: string;
  given_name?: string;
  family_name?: string;
}

interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: string;
}

interface AuthStore {
  user: User | null;
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setWallet: (wallet: Wallet | null) => void;
  logout: () => void;
  fetchUserData: () => Promise<void>;
  fetchWalletData: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  wallet: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setWallet: (wallet) => set({ wallet }),

  logout: () => {
    localStorage.clear();
    set({ user: null, wallet: null });
  },

  fetchUserData: async () => {
    try {
      set({ loading: true });
      const response = await apiClient.get('/users/me');
      set({ user: response.data });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchWalletData: async () => {
    try {
      set({ loading: true });
      const response = await apiClient.get('/wallets');
      if (response.data && response.data.length > 0) {
        set({ wallet: response.data[0] });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },
}));
