'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string | null;
  role: string;
  avatarUrl?: string | null;
  isActive?: boolean;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  hasHydrated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  logout: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true, // Commencer à true pour attendre la réhydratation
      hasHydrated: false,
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-store',
      onRehydrateStorage: () => (state) => {
        // Marquer la réhydratation comme terminée
        state?.setHasHydrated(true);
        // Si aucun utilisateur après réhydratation, passer isLoading à false
        if (!state?.user) {
          state?.setLoading(false);
        }
      },
    }
  )
);

interface LanguageStore {
  language: 'fr' | 'sw' | 'ln';
  setLanguage: (lang: 'fr' | 'sw' | 'ln') => void;
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'fr',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-store',
    }
  )
);
