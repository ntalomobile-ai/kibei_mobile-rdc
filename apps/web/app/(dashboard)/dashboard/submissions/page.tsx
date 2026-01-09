'use client';

import { useEffect, useState } from 'react';
import { useTranslation, useUser } from '@/hooks';
import {
  fetchMarkets,
  fetchMyExchangeRates,
  fetchMyPrices,
  fetchProducts,
  submitExchangeRate,
  submitPrice,
} from '@/lib/api';
import { Badge, Button, Card, ErrorAlert, Input, Loading, Select } from '@kibei/ui';
import { formatDate } from '@kibei/utils';

function toNumber(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  if (typeof v === 'bigint') return Number(v);
  // Prisma Decimal often has toString()
  if (typeof v?.toString === 'function') return Number(v.toString());
  return Number(v);
}

function formatMoneyFromDb(priceValue: any, currency: string) {
  const value = toNumber(priceValue);
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    value
  ) + ` ${currency}`;
}

function formatRateFromDb(rateValue: any) {
  const raw = toNumber(rateValue);
  return raw.toFixed(4);
}

export default function DashboardSubmissionsPage() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Déterminer si l'utilisateur peut voir toutes les soumissions
  const canViewAll = user?.role === 'admin' || user?.role === 'moderator';

  const [prices, setPrices] = useState<any[]>([]);
  const [rates, setRates] = useState<any[]>([]);

  const [products, setProducts] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);

  // Submit price form
  const [productId, setProductId] = useState('');
  const [marketId, setMarketId] = useState('');
  const [priceValue, setPriceValue] = useState('');
  const [currency, setCurrency] = useState('CDF');

  // Submit rate form
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('CDF');
  const [rateValue, setRateValue] = useState('');
  const [rateCityId, setRateCityId] = useState('');

  const canSubmitPrice = productId && marketId && Number(priceValue) > 0;
  const canSubmitRate = fromCurrency && toCurrency && Number(rateValue) > 0;

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const [p, r, prod, m] = await Promise.all([
        fetchMyPrices(),
        fetchMyExchangeRates(),
        fetchProducts(),
        fetchMarkets(),
      ]);
      setPrices(p.data || []);
      setRates(r.data || []);
      setProducts(prod.data || []);
      setMarkets(m.data || []);
    } catch (e) {
      setError('Erreur lors du chargement de vos soumissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitPriceHandler = async () => {
    setError('');
    try {
      await submitPrice(productId, marketId, Number(priceValue), currency);
      setPriceValue('');
      await reload();
    } catch {
      setError('Impossible de soumettre le prix (vérifiez vos droits et les champs).');
    }
  };

  const submitRateHandler = async () => {
    setError('');
    try {
      await submitExchangeRate(fromCurrency, toCurrency, Number(rateValue), rateCityId || undefined);
      setRateValue('');
      setRateCityId('');
      await reload();
    } catch {
      setError('Impossible de soumettre le taux (vérifiez vos droits et les champs).');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {canViewAll ? 'Toutes les soumissions' : t('dashboard.mySubmissions')}
        </h1>
        <p className="text-slate-300/80">
          {canViewAll
            ? 'Consultez toutes les soumissions de prix et taux de change effectuées par les collecteurs.'
            : 'Soumettez de nouveaux prix/taux et suivez le statut.'}
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Soumettre un prix</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200">Produit</label>
              <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Sélectionner...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nameFr} ({p.category})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200">Marché</label>
              <Select value={marketId} onChange={(e) => setMarketId(e.target.value)}>
                <option value="">Sélectionner...</option>
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nameFr} - {m.city?.nameFr}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Prix</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Devise</label>
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="CDF">CDF</option>
                  <option value="USD">USD</option>
                  <option value="ZMW">ZMW</option>
                </Select>
              </div>
            </div>
            <Button disabled={!canSubmitPrice} onClick={submitPriceHandler}>
              Soumettre
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Soumettre un taux de change</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">De</label>
                <Select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
                  <option value="USD">USD</option>
                  <option value="CDF">CDF</option>
                  <option value="ZMW">ZMW</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-200">Vers</label>
                <Select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
                  <option value="CDF">CDF</option>
                  <option value="USD">USD</option>
                  <option value="ZMW">ZMW</option>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200">Ville (optionnel)</label>
              <Select value={rateCityId} onChange={(e) => setRateCityId(e.target.value)}>
                <option value="">Taux global</option>
                {markets.map((m) => (
                  <option key={m.city?.id || m.id} value={m.city?.id || ''}>
                    {m.city?.nameFr || m.nameFr}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-200">Taux</label>
              <Input
                type="number"
                min="0"
                step="0.0001"
                value={rateValue}
                onChange={(e) => setRateValue(e.target.value)}
              />
            </div>
            <Button disabled={!canSubmitRate} onClick={submitRateHandler}>
              Soumettre
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">
            {canViewAll ? 'Tous les prix' : 'Mes prix'}
          </h2>
          <div className="space-y-3">
            {prices.length === 0 ? (
              <p className="text-slate-300/80">Aucune soumission.</p>
            ) : (
              prices.map((p) => (
                <div key={p.id} className="border border-white/10 bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-white">{p.product?.nameFr}</p>
                      <p className="text-sm text-slate-300/80">
                        {p.market?.nameFr} - {p.market?.city?.nameFr}
                        {p.market?.city?.province && ` (${p.market.city.province.nameFr})`}
                      </p>
                      {canViewAll && p.submittedBy && (
                        <p className="text-xs text-slate-400 mt-1">
                          Par: {p.submittedBy.fullName || p.submittedBy.email} ({p.submittedBy.role})
                        </p>
                      )}
                      <p className="text-xs text-slate-300/70">{formatDate(p.createdAt)}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge
                        variant={
                          p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'
                        }
                      >
                        {p.status}
                      </Badge>
                      <div className="font-semibold text-white">{formatMoneyFromDb(p.price, p.currency)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">
            {canViewAll ? 'Tous les taux de change' : 'Mes taux de change'}
          </h2>
          <div className="space-y-3">
            {rates.length === 0 ? (
              <p className="text-slate-300/80">Aucune soumission.</p>
            ) : (
              rates.map((r) => (
                <div key={r.id} className="border border-white/10 bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between gap-4">
                    <div className="flex-1">
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
                      {canViewAll && r.submittedBy && (
                        <p className="text-xs text-slate-400 mt-1">
                          Par: {r.submittedBy.fullName || r.submittedBy.email} ({r.submittedBy.role})
                        </p>
                      )}
                      <p className="text-xs text-slate-300/70">{formatDate(r.createdAt)}</p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge
                        variant={
                          r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'
                        }
                      >
                        {r.status}
                      </Badge>
                      <div className="font-semibold text-white">{formatRateFromDb(r.rate)}</div>
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


