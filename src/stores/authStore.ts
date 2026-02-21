'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthTokens } from '@/app/types/Auth';

interface AuthState {
  // State
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, tokens: Pick<AuthTokens, 'accessToken'>) => void;
  updateUser: (user: Partial<User>) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      // Set complete auth data (login/register)
      setAuth: (user, tokens) => {
        set({
          user,
          accessToken: tokens.accessToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Update user information
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      // Update access token only (from refresh)
      setAccessToken: (accessToken) => {
        set({ accessToken });
      },

      // Clear auth state (logout)
      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Set loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Initialize auth state from storage
      initialize: () => {
        const state = get();
        if (state.accessToken && state.user) {
          set({ isAuthenticated: true, isLoading: false });
        } else {
          set({ isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // NOTE: refreshToken is intentionally NOT persisted here.
      // The refresh token lives exclusively in an httpOnly cookie managed by the server.
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
          state.isAuthenticated = !!(state.accessToken && state.user);
        }
      },
    }
  )
);
