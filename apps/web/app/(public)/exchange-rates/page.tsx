'use client';

import { useTranslation } from '@/hooks';
import { useState, useEffect } from 'react';
import { fetchExchangeRates } from '@/lib/api';
import { Card, Loading, ErrorAlert, Badge } from '@kibei/ui';
import { formatDate } from '@kibei/utils';

function toNumber(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  if (typeof v === 'bigint') return Number(v);
  if (typeof v?.toString === 'function') return Number(v.toString());
  return Number(v);
}

export default function ExchangeRatesPage() {
  const { t } = useTranslation();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRates() {
      try {
        const data = await fetchExchangeRates();
        setRates(data.data);
      } catch (err) {
        setError('Erreur lors du chargement des taux');
      } finally {
        setLoading(false);
      }
    }

    loadRates();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">{t('exchangeRates.title')}</h1>

      {error && <ErrorAlert message={error} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rates.map((rate: any) => (
          <Card key={rate.id} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">
                  {rate.fromCurrency} → {rate.toCurrency}
                </h3>
                <p className="text-2xl font-semibold text-white">
                  {toNumber(rate.rate).toFixed(4)}
                </p>
              </div>
              <Badge variant="default">{rate.source || 'Non spécifié'}</Badge>
            </div>
            <p className="text-sm text-slate-300/70">
              {t('prices.submitted')}: {formatDate(rate.createdAt)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
