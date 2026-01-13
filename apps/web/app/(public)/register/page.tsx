'use client';

import { useTranslation, useUser } from '@/hooks';
import { Button, Input, ErrorAlert } from '@kibei/ui';
import { useRegisterForm } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { t } = useTranslation();
  const {
    email,
    setEmail,
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    handleSubmit,
  } = useRegisterForm();
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
          <h1 className="text-3xl font-bold">Créer un compte</h1>
          <p className="text-slate-300/80 mt-2">
            Rejoignez KiBei pour suivre les prix et taux de change en RDC.
          </p>
        </div>

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Nom complet
            </label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              {t('auth.email')}
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="text-xs text-slate-300/70 mt-1">
              L'email est requis pour les informations et communications
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Numéro de téléphone (optionnel)
            </label>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+243 900 000 000"
            />
            <p className="text-xs text-slate-300/70 mt-1">
              Vous pourrez vous connecter avec votre nom complet ou ce numéro de téléphone
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
              autoComplete="new-password"
              required
              minLength={8}
            />
            <p className="text-xs text-slate-300/70 mt-1">
              Le mot de passe doit contenir au moins 8 caractères
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Confirmer le mot de passe
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full">
            Créer mon compte
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-300/80 text-sm">
            Vous avez déjà un compte ?{' '}
            <Link href="/login" className="text-slate-200 hover:text-white font-medium">
              Se connecter
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-slate-300/70 text-center">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/terms" className="text-slate-200 hover:text-white underline">
              conditions d'utilisation
            </Link>{' '}
            et notre{' '}
            <Link href="/privacy" className="text-slate-200 hover:text-white underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

