'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/hooks';
import { Button } from '@kibei/ui';
import { fetchMe, logoutUser } from '@/lib/auth';
import { fetchNotifications } from '@/lib/api';
import { Logo } from '@/components/Logo';

function NavItem({ href, label, active, badge, showBell }: { href: string; label: string; active: boolean; badge?: number; showBell?: boolean }) {
  return (
    <Link href={href} className="flex-1">
      <div
        className={`flex flex-col items-center justify-center gap-1 py-2 relative ${
          active ? 'text-white' : 'text-slate-300/70 hover:text-white'
        }`}
      >
        <div className="relative">
          {showBell ? (
            <div className="relative">
              <svg
                className={`w-5 h-5 ${badge && badge > 0 ? 'bell-animate has-notifications' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {badge !== undefined && badge > 0 && (
                <div className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-gradient-to-br from-[#CE1126] to-[#8B0000] ring-2 ring-[#070A12] flex items-center justify-center notification-badge shadow-lg shadow-[#CE1126]/50">
                  <span className="text-[9px] font-bold text-white">{badge > 9 ? '9+' : badge}</span>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[#FCD116]' : 'bg-white/10'}`} />
              {badge !== undefined && badge > 0 && (
                <div className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-gradient-to-br from-[#CE1126] to-[#8B0000] ring-2 ring-[#070A12] flex items-center justify-center notification-badge shadow-lg shadow-[#CE1126]/50">
                  <span className="text-[9px] font-bold text-white">{badge > 9 ? '9+' : badge}</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="text-[11px]">{label}</div>
      </div>
    </Link>
  );
}

export default function PublicUserAppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, setUser, isLoading, hasHydrated } = useUser();
  const [notificationCount, setNotificationCount] = useState(0);
  const notifInFlight = useRef(false);

  useEffect(() => {
    // Ne pas rediriger pendant la réhydratation ou le chargement de l'authentification
    if (!hasHydrated || isLoading) return;
    
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== 'user_public') {
      router.replace('/dashboard');
    }
  }, [user, router, isLoading, hasHydrated]);

  useEffect(() => {
    // Keep Zustand user in sync with server cookies. If session expired, send to login.
    // Note: L'AuthProvider global vérifie déjà l'authentification au chargement,
    // donc on attend un peu avant de vérifier ici pour éviter les conflits
    async function syncMe() {
      if (!user) return;
      
      // Attendre un peu pour laisser l'AuthProvider faire son travail
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const me = await fetchMe();
        setUser(me.user);
      } catch {
        logout();
        router.replace('/login');
      }
    }
    syncMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Charger le nombre de notifications (variations récentes) en excluant les masquées
  // Les notifications sont publiques, donc on peut les charger immédiatement
  useEffect(() => {
    async function loadNotifications() {
      if (notifInFlight.current) return;
      notifInFlight.current = true;
      try {
        // Récupérer le maximum de notifications autorisé (50) pour avoir un comptage précis
        // L'API limite take à 50 maximum
        const result = await fetchNotifications(50);
        // Filtrer les notifications masquées
        const hidden = getHiddenNotifications();
        const visibleNotifications = (result.data || []).filter(
          (n: any) => !hidden.has(`${n.type}-${n.id}`)
        );
        setNotificationCount(visibleNotifications.length);
      } catch (error) {
        // Silently fail - notifications are not critical
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        notifInFlight.current = false;
      }
    }
    
    // Charger immédiatement car les notifications sont publiques
    loadNotifications();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    
    // Écouter les changements dans localStorage pour les notifications masquées
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'hiddenNotifications') {
        loadNotifications();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Écouter aussi les changements dans la même fenêtre (via custom event)
    const handleCustomStorageChange = () => {
      loadNotifications();
    };
    window.addEventListener('notificationHidden', handleCustomStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('notificationHidden', handleCustomStorageChange);
    };
  }, []); // Exécuter une seule fois au montage

  function getHiddenNotifications(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
      const hidden = localStorage.getItem('hiddenNotifications');
      return hidden ? new Set(JSON.parse(hidden)) : new Set();
    } catch {
      return new Set();
    }
  }

  const handleLogout = async () => {
    await logoutUser();
    logout();
    router.push('/');
  };

  // Attendre la réhydratation du store et la fin du chargement de l'authentification avant de rediriger     
  if (!hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="md" showText={true} />
          </div>
          <p className="text-slate-300/80">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-28">
        <div className="mb-6 flex justify-center">
          <Logo size="md" showText={true} />
        </div>
        {children}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#070A12]/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2">
          <NavItem href="/app" label="Maison" active={pathname === '/app'} />
          <NavItem href="/app/rates" label="Taux" active={pathname === '/app/rates'} />

          {/* FAB */}
          <Link href="/app/report" className="mx-2">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#00A3E0] to-[#0066B3] ring-1 ring-white/10 shadow-lg shadow-[#00A3E0]/15 grid place-items-center text-white text-xl">
              +
            </div>
          </Link>

          <NavItem href="/app/profile" label="Profil" active={pathname === '/app/profile'} />
          <NavItem
            href="/app/notifications"
            label="Notifications"
            active={pathname === '/app/notifications'}
            badge={notificationCount}
            showBell={true}
          />
        </div>
      </div>
    </div>
  );
}


