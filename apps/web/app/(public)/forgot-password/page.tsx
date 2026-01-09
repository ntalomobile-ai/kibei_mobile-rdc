'use client';

import { useTranslation, useUser } from '@/hooks';
import { Button, Input, ErrorAlert, SuccessAlert } from '@kibei/ui';
import { useForgotPasswordForm } from '@/lib/auth';
import { Logo } from '@/components/Logo';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { email, setEmail, error, success, isLoading, handleSubmit } = useForgotPasswordForm();
  const { user, isLoading: userLoading, hasHydrated } = useUser();
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold">Mot de passe oublié</h1>
          <p className="text-slate-300/80 mt-2">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        {error && <ErrorAlert message={error} />}
        {success && (
          <SuccessAlert message="Si cet email existe dans notre système, un lien de réinitialisation a été envoyé à votre adresse email." />
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-6">
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
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-slate-300/80 mb-6">
              Vérifiez votre boîte de réception (et votre dossier spam) pour le lien de réinitialisation.
            </p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Retour à la connexion
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

