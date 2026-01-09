'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useStore';
import { fetchMe } from '@/lib/auth';

/**
 * AuthProvider - Restaure la session utilisateur au chargement de l'application
 * Vérifie si l'utilisateur a des cookies valides et restaure la session
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, logout, isLoading, setLoading, hasHydrated } = useAuth();
  const hasChecked = useRef(false);

  useEffect(() => {
    // Attendre la réhydratation du store avant de vérifier l'authentification
    if (!hasHydrated) return;
    
    // Éviter de vérifier plusieurs fois
    if (hasChecked.current) return;
    
    // Vérifier l'authentification au chargement
    async function checkAuth() {
      hasChecked.current = true;
      setLoading(true);

      try {
        // Toujours vérifier les cookies, même si on a un utilisateur dans le store
        // Cela permet de restaurer la session après un rafraîchissement
        const me = await fetchMe();
        setUser(me.user);
      } catch (error) {
        // Si la session est expirée ou invalide
        if (user) {
          // Si on avait un utilisateur dans le store mais que les cookies sont invalides
          console.log('Session expirée, déconnexion...');
          logout();
        }
        // Si pas d'utilisateur, on laisse simplement l'utilisateur non connecté
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]); // Exécuter une fois la réhydratation terminée

  return <>{children}</>;
}

