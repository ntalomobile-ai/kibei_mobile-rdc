'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks';
import { useTranslation } from '@/hooks';
import {
  fetchPendingExchangeRatesToValidate,
  fetchPendingPricesToValidate,
  validateExchangeRate,
  validatePrice,
} from '@/lib/api';
import { Badge, Button, Card, ErrorAlert, Loading } from '@kibei/ui';
import { formatDate } from '@kibei/utils';

function toNumber(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  if (typeof v === 'bigint') return Number(v);
  if (typeof v?.toString === 'function') return Number(v.toString());
  return Number(v);
}

function formatMoneyFromDb(priceScaledBy100: any, currency: string) {
  const value = toNumber(priceScaledBy100);
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    value
  ) + ` ${currency}`;
}

function formatRateFromDb(rateScaledBy10000: any) {
  const raw = toNumber(rateScaledBy10000);
  return raw.toFixed(4);
}

export default function DashboardValidatePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prices, setPrices] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const [p, r] = await Promise.all([
        fetchPendingPricesToValidate(),
        fetchPendingExchangeRatesToValidate(),
      ]);
      setPrices(p.data || []);
      setRates(r.data || []);
    } catch {
      setError('Erreur lors du chargement des éléments à valider');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'moderator' && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user) return <Loading />;
  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {user?.role === 'admin' ? 'Toutes les soumissions à valider' : t('dashboard.toValidate')}
        </h1>
        <p className="text-slate-300/80">
          {user?.role === 'admin'
            ? 'Approuver ou rejeter toutes les soumissions en attente de tous les collecteurs.'
            : 'Approuver ou rejeter les soumissions en attente de votre province.'}
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Prix en attente</h2>
          <div className="space-y-3">
            {prices.length === 0 ? (
              <p className="text-slate-300/80">Aucun prix en attente.</p>
            ) : (
              prices.map((p) => (
                <div key={p.id} className="border border-white/10 bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-white">{p.product?.nameFr}</p>
                      <p className="text-sm text-slate-300/80">
                        {p.market?.nameFr} - {p.market?.city?.nameFr} ({p.market?.city?.province?.nameFr})
                      </p>
                      <p className="text-xs text-slate-300/70">
                        Soumis par {p.submittedBy?.fullName || p.submittedBy?.email} ({p.submittedBy?.role}) • {formatDate(p.createdAt)}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="warning">pending</Badge>
                      <div className="font-semibold text-white">{formatMoneyFromDb(p.price, p.currency)}</div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              await validatePrice(p.id, true);
                              await reload();
                            } catch {
                              setError('Validation impossible.');
                            }
                          }}
                        >
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            try {
                              await validatePrice(p.id, false);
                              await reload();
                            } catch {
                              setError('Rejet impossible.');
                            }
                          }}
                        >
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Taux en attente</h2>
          <div className="space-y-3">
            {rates.length === 0 ? (
              <p className="text-slate-300/80">Aucun taux en attente.</p>
            ) : (
              rates.map((r) => (
                <div key={r.id} className="border border-white/10 bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {r.fromCurrency} → {r.toCurrency}
                      </p>
                      {r.city && (
                        <p className="text-sm text-slate-300/80">
                          {r.city.nameFr}
                          {r.city.province && ` (${r.city.province.nameFr})`}
                        </p>
                      )}
                      {!r.city && <p className="text-sm text-slate-300/80">Taux global</p>}
                      <p className="text-xs text-slate-300/70">
                        Soumis par {r.submittedBy?.fullName || r.submittedBy?.email} ({r.submittedBy?.role}) • {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="warning">pending</Badge>
                      <div className="font-semibold text-white">{formatRateFromDb(r.rate)}</div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              await validateExchangeRate(r.id, true);
                              await reload();
                            } catch {
                              setError('Validation impossible.');
                            }
                          }}
                        >
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            try {
                              await validateExchangeRate(r.id, false);
                              await reload();
                            } catch {
                              setError('Rejet impossible.');
                            }
                          }}
                        >
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}


