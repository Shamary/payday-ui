import { create } from 'zustand';
import { apiClient } from '@/lib/api';

export interface AppUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'USER' | 'ADMIN';
  accountStatus: 'active' | 'suspended' | 'closed';
}

interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: string;
}

interface AuthStore {
  user: AppUser | null;
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
  setUser: (user: AppUser | null) => void;
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
      set({ user: null });
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
