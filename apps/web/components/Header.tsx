'use client';

import { useTranslation } from '@/hooks';
import { Button } from '@kibei/ui';
import Link from 'next/link';
import { useLanguage } from '@/hooks/useStore';
import { useUser } from '@/hooks';
import { logoutUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';

export function Header() {
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguage();
  const { user, logout } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070A12]/60 backdrop-blur">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Logo href="/" size="md" showText={true} />

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200"
            >
              {t('nav.home')}
            </Link>
            <Link
              href="/prices"
              className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200"
            >
              {t('nav.prices')}
            </Link>
            <Link
              href="/exchange-rates"
              className="px-3 py-2 rounded-lg hover:bg-white/5 text-slate-200"
            >
              {t('nav.exchangeRates')}
            </Link>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-white/5 ring-1 ring-white/10 p-1">
            {(['fr', 'sw', 'ln'] as const).map((lng) => (
              <button
                key={lng}
                onClick={() => setLanguage(lng)}
                className={`px-2.5 py-1 text-xs rounded-lg transition ${
                  language === lng
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {lng.toUpperCase()}
              </button>
            ))}
          </div>

          {user ? (
            <div className="flex gap-2 items-center">
              {user.role === 'user_public' ? (
                <Link href="/app">
                  <Button variant="outline" size="sm">
                    Explorer
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    {t('nav.dashboard')}
                  </Button>
                </Link>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm">
                {t('nav.logout')}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <Link href="/register">
                <Button variant="outline" size="sm">
                  S'inscrire
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  {t('nav.login')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
