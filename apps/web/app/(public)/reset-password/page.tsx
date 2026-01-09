'use client';

import { useTranslation, useUser } from '@/hooks';
import { Button, Input, ErrorAlert, SuccessAlert } from '@kibei/ui';
import { useResetPasswordForm } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [tokenError, setTokenError] = useState<string | null>(null);
  
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    isLoading,
    handleSubmit,
  } = useResetPasswordForm(token);

  const { user, isLoading: userLoading, hasHydrated } = useUser();

  // Vérifier que le token est présent
  useEffect(() => {
    if (!token) {
      setTokenError('Token de réinitialisation manquant ou invalide.');
    }
  }, [token]);

  // Rediriger les utilisateurs déjà connectés
  useEffect(() => {
    if (!hasHydrated || userLoading) return;

    if (user) {
      if (user.role === 'user_public') {
        router.replace('/app');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, userLoading, hasHydrated, router]);

  if (!hasHydrated || userLoading || user) {
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

  if (tokenError || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Token invalide</h1>
            <p className="text-slate-300/80 mb-6">
              {tokenError || 'Le lien de réinitialisation est invalide ou expiré.'}
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/forgot-password">
                <Button variant="outline">Demander un nouveau lien</Button>
              </Link>
              <Link href="/login">
                <Button>Retour à la connexion</Button>
              </Link>
            </div>
          </div>
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
          <h1 className="text-3xl font-bold">Réinitialiser le mot de passe</h1>
          <p className="text-slate-300/80 mt-2">
            Entrez votre nouveau mot de passe ci-dessous.
          </p>
        </div>

        {error && <ErrorAlert message={error} />}
        {success && (
          <SuccessAlert message="Votre mot de passe a été réinitialisé avec succès. Redirection vers la page de connexion..." />
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Nouveau mot de passe
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-slate-300/70 mt-1">
                Le mot de passe doit contenir au moins 8 caractères
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Confirmer le nouveau mot de passe
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-slate-300/80 mb-6">
              Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
            </p>
            <Link href="/login">
              <Button className="w-full">
                Aller à la page de connexion
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-slate-200/80 hover:text-white text-sm">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

