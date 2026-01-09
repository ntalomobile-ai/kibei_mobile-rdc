'use client';

import { useTranslation } from '@/hooks';
import { useUser } from '@/hooks';
import { Button } from '@kibei/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { logoutUser } from '@/lib/auth';
import { fetchMe } from '@/lib/auth';
import { useEffect } from 'react';
import { Logo } from '@/components/Logo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { user, logout, setUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutUser();
    logout();
    router.push('/');
  };

  useEffect(() => {
    // If we have a user in local storage, validate it against the server cookies.
    // This avoids "ghost sessions" after token expiry.
    // Note: L'AuthProvider global vÃ©rifie dÃ©jÃ  l'authentification au chargement,
    // donc on attend un peu avant de vÃ©rifier ici pour Ã©viter les conflits
    async function syncMe() {
      if (!user) return;
      
      // Attendre un peu pour laisser l'AuthProvider faire son travail
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const me = await fetchMe();
        setUser(me.user);
      } catch (err: any) {
        // Si la session est expirÃ©e, dÃ©connecter et rediriger
        console.error('Session expirÃ©e:', err);
        logout();
        router.push('/login');
      }
    }
    syncMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    // Dashboard is reserved for staff roles; public users should use public pages.
    if (user?.role === 'user_public') {
      router.replace('/app');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold mb-3">AccÃ¨s RefusÃ©</h1>
          <p className="mb-6 text-slate-300/80">
            Veuillez vous connecter pour accÃ©der au dashboard.
          </p>
          <Link href="/login">
            <Button>{t('auth.login')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === 'user_public') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold mb-3">AccÃ¨s limitÃ©</h1>
          <p className="mb-6 text-slate-300/80">
            Le dashboard est rÃ©servÃ© aux rÃ´les collecteur/modÃ©rateur/admin.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/app">
              <Button>{t('nav.home')}</Button>
            </Link>
            <Link href="/prices">
              <Button variant="outline">{t('nav.prices')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const linkBase =
    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors';
  const linkActive =
    'bg-white/10 text-white ring-1 ring-white/10';
  const linkIdle =
    'text-slate-200/80 hover:text-white hover:bg-white/5';

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="flex">
      <aside className="w-72 shrink-0 min-h-screen p-6 border-r border-white/10 bg-[#070A12]/40 backdrop-blur">
        <div className="mb-8">
          <Logo size="md" showText={true} />
          <p className="text-xs text-slate-300/70 mt-2 ml-1">Dashboard</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className={`${linkBase} ${isActive('/dashboard') && pathname === '/dashboard' ? linkActive : linkIdle}`}
          >
            {t('dashboard.title')}
          </Link>
          <Link
            href="/dashboard/submissions"
            className={`${linkBase} ${isActive('/dashboard/submissions') ? linkActive : linkIdle}`}
          >
            {t('dashboard.mySubmissions')}
          </Link>
          {(user.role === 'moderator' || user.role === 'admin') && (
            <Link
              href="/dashboard/validate"
              className={`${linkBase} ${isActive('/dashboard/validate') ? linkActive : linkIdle}`}
            >
              {t('dashboard.toValidate')}
            </Link>
          )}

          {user.role === 'admin' && (
            <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
              <p className="text-xs uppercase tracking-wider text-slate-300/60 px-1">
                Admin
              </p>
              <Link
                href="/dashboard/users"
                className={`${linkBase} ${isActive('/dashboard/users') ? linkActive : linkIdle}`}
              >
                {t('admin.users')}
              </Link>
              <Link
                href="/dashboard/provinces"
                className={`${linkBase} ${isActive('/dashboard/provinces') ? linkActive : linkIdle}`}
              >
                {t('admin.provinces')}
              </Link>
              <Link
                href="/dashboard/cities"
                className={`${linkBase} ${isActive('/dashboard/cities') ? linkActive : linkIdle}`}
              >
                {t('admin.cities')}
              </Link>
              <Link
                href="/dashboard/markets"
                className={`${linkBase} ${isActive('/dashboard/markets') ? linkActive : linkIdle}`}
              >
                {t('admin.markets') || 'MarchÃ©s'}
              </Link>
              <Link
                href="/dashboard/products"
                className={`${linkBase} ${isActive('/dashboard/products') ? linkActive : linkIdle}`}
              >
                {t('admin.products')}
              </Link>
              <Link
                href="/dashboard/reports"
                className={`${linkBase} ${isActive('/dashboard/reports') ? linkActive : linkIdle}`}
              >
                ðŸ›¡ï¸ Signalements
              </Link>
            </div>
          )}
        </nav>

        <div className="mt-10 pt-6 border-t border-white/10">
          <div className="mb-4">
            <p className="text-sm text-slate-200/80 break-all">{user.email}</p>
            <p className="text-xs text-slate-300/60">{user.role}</p>
          </div>
          <Button onClick={handleLogout} variant="destructive" className="w-full">
            {t('nav.logout')}
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}

