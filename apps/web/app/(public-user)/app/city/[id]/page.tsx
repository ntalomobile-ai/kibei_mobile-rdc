'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchCityById, fetchExchangeRates } from '@/lib/api';
import { Card, ErrorAlert, Loading } from '@kibei/ui';
import { svgThumb } from '../../_components/thumb';

export default function PublicCityPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState<any>(null);
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [c, r] = await Promise.all([fetchCityById(id), fetchExchangeRates(id)]);
        setCity(c.data);

        const list = r.data || [];
        const preferred =
          list.find((x: any) => x?.fromCurrency === 'USD' && x?.toCurrency === 'CDF') ?? list[0];
        const n = preferred?.rate == null ? null : Number(String(preferred.rate));
        setRate(Number.isFinite(n) ? n : null);
      } catch {
        setError('Ville introuvable.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const markets = useMemo(() => city?.markets || [], [city]);

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} />;
  if (!city) return <ErrorAlert message="Ville introuvable." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
        >
          ←
        </button>
        <h1 className="text-xl font-semibold text-white">{city.nameFr}</h1>
      </div>

      <Card className="p-0 overflow-hidden">
        <img
          src={city.imageUrl || svgThumb(city.nameFr || 'Ville', '#1F4DFF')}
          alt={city.nameFr}
          className="h-44 w-full object-cover"
        />
        <div className="p-5">
          <div className="text-center">
            <div className="text-3xl font-extrabold text-white">{city.nameFr}</div>
            <div className="text-sm text-slate-300/80 mt-2">
              TAUX USD→CDF :{' '}
              <span className="font-semibold text-[#BFEFFF]">{rate != null ? `${rate.toFixed(0)} CDF` : '—'}</span>
            </div>
            <div className="text-sm text-slate-300/80">
              Nombre de marchés : <span className="font-semibold text-white">{markets.length}</span>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-lg font-bold text-[#CE1126] mb-2">Marchés</div>
            <div className="space-y-2">
              {markets.map((m: any) => (
                <div key={m.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="font-medium text-white">{m.nameFr}</div>
                </div>
              ))}
              {markets.length === 0 && (
                <div className="text-sm text-slate-300/70">Aucun marché.</div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


