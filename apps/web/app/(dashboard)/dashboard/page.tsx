'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks';
import { useUser } from '@/hooks';
import { Card, Badge, Loading, ErrorAlert, Button } from '@kibei/ui';
import Link from 'next/link';
import { formatDate } from '@kibei/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function refreshSessionIfPossible() {
  const r = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!r.ok) {
    const errorData = await r.json().catch(() => ({}));
    throw new Error(errorData.error || 'Refresh failed');
  }
}

async function fetchDashboardStats() {
  // Fonction pour faire la requête
  const makeRequest = async () => {
    return fetch(`${API_BASE_URL}/api/dashboard/stats`, {
      credentials: 'include',
    });
  };

  let response = await makeRequest();

  // Si 401, essayer de rafraîchir le token et réessayer
  if (response.status === 401) {
    try {
      await refreshSessionIfPossible();
      // Réessayer la requête après le rafraîchissement
      response = await makeRequest();
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

function formatMoney(price: any, currency: string = 'CDF') {
  const value = Number(price) || 0;
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    value
  ) + ` ${currency}`;
}

function formatRate(rate: any) {
  const value = Number(rate) || 0;
  return value.toFixed(4);
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      setError('');
      try {
        const result = await fetchDashboardStats();
        setStats(result.data || {});
      } catch (err: any) {
        if (err.message?.includes('Session expirée') || err.message?.includes('Refresh failed')) {
          // Rediriger vers la page de login si la session est expirée
          window.location.href = '/login';
          return;
        }
        setError('Impossible de charger les statistiques.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <Loading />;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h1>
          <p className="text-slate-300/80">
            {isAdmin ? 'Vue d\'ensemble complète de la plateforme' : 'Tableau de bord personnel'}
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Link href="/dashboard/validate">
              <Button variant="outline" size="sm">
                Valider les soumissions
              </Button>
            </Link>
            <Link href="/dashboard/submissions">
              <Button variant="outline" size="sm">
                Voir toutes les soumissions
              </Button>
            </Link>
          </div>
        )}
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-[#00A3E0]/10 to-[#0066B3]/10 border-[#00A3E0]/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-300">Soumissions</h3>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats?.submissions || 0}</p>
          <p className="text-xs text-slate-400">Total prix + taux</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-300">Approuvées</h3>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats?.approved || 0}</p>
          <p className="text-xs text-slate-400">
            {isAdmin && stats?.approvedPrices ? `${stats.approvedPrices} prix, ${stats.approvedRates} taux` : 'Prix approuvés'}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#FCD116]/10 to-[#FCD116]/20 border-[#FCD116]/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-300">À Valider</h3>
            <span className="text-2xl">⏳</span>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{stats?.toValidate || 0}</p>
          <p className="text-xs text-slate-400">
            {isAdmin && stats?.pendingPrices ? `${stats.pendingPrices} prix, ${stats.pendingRates} taux` : 'En attente'}
          </p>
        </Card>

        {isAdmin && (
          <Card className="p-6 bg-gradient-to-br from-[#CE1126]/10 to-[#CE1126]/20 border-[#CE1126]/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-300">Rejetées</h3>
              <span className="text-2xl">❌</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats?.rejected || 0}</p>
            <p className="text-xs text-slate-400">Soumissions rejetées</p>
          </Card>
        )}
      </div>

      {isAdmin && (
        <>
          {/* Statistiques des entités */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">👥</div>
              <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
              <p className="text-xs text-slate-400">Utilisateurs</p>
              <Link href="/dashboard/users" className="text-xs text-[#00A3E0] hover:underline mt-2 block">
                Gérer →
              </Link>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">🗺️</div>
              <p className="text-2xl font-bold text-white">{stats?.totalProvinces || 0}</p>
              <p className="text-xs text-slate-400">Provinces</p>
              <Link href="/dashboard/provinces" className="text-xs text-[#00A3E0] hover:underline mt-2 block">
                Gérer →
              </Link>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">🏙️</div>
              <p className="text-2xl font-bold text-white">{stats?.totalCities || 0}</p>
              <p className="text-xs text-slate-400">Villes</p>
              <Link href="/dashboard/cities" className="text-xs text-[#00A3E0] hover:underline mt-2 block">
                Gérer →
              </Link>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">🏪</div>
              <p className="text-2xl font-bold text-white">{stats?.totalMarkets || 0}</p>
              <p className="text-xs text-slate-400">Marchés</p>
              <Link href="/dashboard/markets" className="text-xs text-[#00A3E0] hover:underline mt-2 block">
                Gérer →
              </Link>
            </Card>

            <Card className="p-4 text-center">
              <div className="text-2xl mb-2">🛒</div>
              <p className="text-2xl font-bold text-white">{stats?.totalProducts || 0}</p>
              <p className="text-xs text-slate-400">Produits</p>
              <Link href="/dashboard/products" className="text-xs text-[#00A3E0] hover:underline mt-2 block">
                Gérer →
              </Link>
            </Card>
          </div>

          {/* Répartition des utilisateurs par rôle */}
          {stats?.usersByRole && (
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Répartition des utilisateurs</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.usersByRole).map(([role, count]: [string, any]) => (
                  <div key={role} className="text-center p-3 bg-white/5 rounded-lg">
                    <p className="text-2xl font-bold text-white">{count}</p>
                    <p className="text-sm text-slate-400 capitalize">{role.replace('_', ' ')}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Activité récente */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Prix récents</h2>
                <Link href="/dashboard/submissions" className="text-sm text-[#00A3E0] hover:underline">
                  Voir tout →
                </Link>
              </div>
              <div className="space-y-3">
                {stats?.recentPrices && stats.recentPrices.length > 0 ? (
                  stats.recentPrices.map((p: any) => (
                    <div key={p.id} className="border border-white/10 bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{p.product?.nameFr}</p>
                          <p className="text-sm text-slate-300/80">
                            {p.market?.nameFr} - {p.market?.city?.nameFr} ({p.market?.city?.province?.nameFr})
                          </p>
                          {p.submittedBy && (
                            <p className="text-xs text-slate-400 mt-1">
                              Par: {p.submittedBy.fullName || p.submittedBy.email}
                            </p>
                          )}
                          <p className="text-xs text-slate-400">{formatDate(p.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              p.status === 'approved'
                                ? 'success'
                                : p.status === 'rejected'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {p.status}
                          </Badge>
                          <p className="text-sm font-semibold text-white mt-2">
                            {formatMoney(p.price, p.currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-300/80 text-center py-4">Aucun prix récent</p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Taux récents</h2>
                <Link href="/dashboard/submissions" className="text-sm text-[#00A3E0] hover:underline">
                  Voir tout →
                </Link>
              </div>
              <div className="space-y-3">
                {stats?.recentRates && stats.recentRates.length > 0 ? (
                  stats.recentRates.map((r: any) => (
                    <div key={r.id} className="border border-white/10 bg-white/5 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-white">
                            {r.fromCurrency} → {r.toCurrency}
                          </p>
                          {r.city ? (
                            <p className="text-sm text-slate-300/80">
                              {r.city.nameFr} ({r.city.province?.nameFr})
                            </p>
                          ) : (
                            <p className="text-sm text-slate-300/80">Taux global</p>
                          )}
                          {r.submittedBy && (
                            <p className="text-xs text-slate-400 mt-1">
                              Par: {r.submittedBy.fullName || r.submittedBy.email}
                            </p>
                          )}
                          <p className="text-xs text-slate-400">{formatDate(r.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              r.status === 'approved'
                                ? 'success'
                                : r.status === 'rejected'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {r.status}
                          </Badge>
                          <p className="text-sm font-semibold text-white mt-2">
                            {formatRate(r.rate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-300/80 text-center py-4">Aucun taux récent</p>
                )}
              </div>
            </Card>
          </div>

          {/* Signalements ouverts */}
          {stats?.openReports !== undefined && stats.openReports > 0 && (
            <Card className="p-6 bg-gradient-to-br from-[#CE1126]/10 to-[#CE1126]/20 border-[#CE1126]/30">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">🚨 Signalements en attente</h2>
                  <p className="text-slate-300/80">
                    {stats.openReports} signalement{stats.openReports > 1 ? 's' : ''} nécessite{stats.openReports > 1 ? 'nt' : ''} votre attention
                  </p>
                </div>
                <Link href="/dashboard/reports">
                  <Button>Voir les signalements</Button>
                </Link>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Message de bienvenue */}
      <Card className="p-6 bg-gradient-to-br from-[#00A3E0]/10 to-[#0066B3]/10 border-[#00A3E0]/20">
        <h2 className="text-2xl font-bold mb-2 text-white">Bienvenue, {user?.fullName}!</h2>
        <p className="text-slate-300/80 mb-4">
          {isAdmin
            ? 'Vous gérez la plateforme KiBei. Utilisez les liens ci-dessus pour accéder rapidement aux différentes sections de gestion.'
            : 'Bienvenue sur votre tableau de bord KiBei. Suivez vos soumissions et leur statut.'}
        </p>
        <Badge variant="default">Rôle: {user?.role}</Badge>
      </Card>
    </div>
  );
}
