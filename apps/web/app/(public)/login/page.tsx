'use client';

import { useTranslation, useUser } from '@/hooks';
import { Button, Input, ErrorAlert, SuccessAlert } from '@kibei/ui';
import { useLoginForm } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { t } = useTranslation();
  const { identifier, setIdentifier, password, setPassword, error, handleSubmit } = useLoginForm();
  const { user, isLoading, hasHydrated } = useUser();
  const router = useRouter();

  // Rediriger les utilisateurs déjà connectés
  useEffect(() => {
    // Attendre la réhydratation et la fin du chargement avant de vérifier
    if (!hasHydrated || isLoading) return;

    if (user) {
      // Rediriger vers le dashboard approprié selon le rôle
      if (user.role === 'user_public') {
        router.replace('/app');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, hasHydrated, router]);

  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (!hasHydrated || isLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <p className="text-slate-300/80">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold">{t('auth.login')}</h1>
          <p className="text-slate-300/80 mt-2">Accès sécurisé à votre espace.</p>
        </div>

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Email, nom complet ou numéro de téléphone
            </label>
            <Input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Email, nom complet ou téléphone"
              required
            />
            <p className="text-xs text-slate-300/70 mt-1">
              Les utilisateurs publics peuvent se connecter avec leur nom complet ou numéro de téléphone
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              {t('auth.password')}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            {t('auth.login')}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <div>
            <p className="text-slate-300/80 text-sm">
              Vous n'avez pas encore de compte ?{' '}
              <Link href="/register" className="text-slate-200 hover:text-white font-medium">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
