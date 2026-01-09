'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchCities, fetchExchangeRateHistory, fetchExchangeRates } from '@/lib/api';
import { Card, ErrorAlert, Input, Loading } from '@kibei/ui';
import { svgThumb } from '../_components/thumb';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PublicRatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rates, setRates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  // Support deep-link: /app/rates?cityId=...
  const urlCityId = searchParams.get('cityId') ?? '';
  useEffect(() => {
    if (urlCityId && urlCityId !== selectedCityId) setSelectedCityId(urlCityId);
    // If param removed, allow user to keep state (don’t force-clear)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCityId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [r, c] = await Promise.all([
          fetchExchangeRates(selectedCityId || undefined),
          fetchCities()
        ]);
        setRates(r.data || []);
        setCities(c.data || []);
      } catch {
        setError('Impossible de charger les taux.');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCityId]);

  const top = useMemo(() => {
    if (!rates?.length) return null;
    const preferred =
      rates.find((r: any) => r?.fromCurrency === 'USD' && r?.toCurrency === 'CDF') ?? rates[0];
    return preferred;
  }, [rates]);
  const rateValue = useMemo(() => {
    const v = top?.rate;
    if (v == null) return null;
    const n = typeof v === 'number' ? v : Number(String(v));
    return Number.isFinite(n) ? n : null;
  }, [top]);

  useEffect(() => {
    (async () => {
      if (!top?.fromCurrency || !top?.toCurrency) return;
      try {
        const h = await fetchExchangeRateHistory({
          fromCurrency: top.fromCurrency,
          toCurrency: top.toCurrency,
          cityId: top.cityId || undefined,
          take: 30,
        });
        setHistory(h.data || []);
      } catch {
        // Non-blocking
        setHistory([]);
      }
    })();
  }, [top?.fromCurrency, top?.toCurrency]);

  const filteredCities = useMemo(() => {
    let list = cities || [];
    if (selectedCityId) list = list.filter((c: any) => c.id === selectedCityId);
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter((c: any) => {
      const hay = [c.nameFr, c.province?.nameFr].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(s);
    });
  }, [cities, q, selectedCityId]);

  const rateByCityIdForTopPair = useMemo(() => {
    const map = new Map<string, number>();
    if (!top?.fromCurrency || !top?.toCurrency) return map;
    for (const r of rates || []) {
      if (r?.fromCurrency !== top.fromCurrency) continue;
      if (r?.toCurrency !== top.toCurrency) continue;
      if (!r?.cityId) continue;
      const n = r?.rate == null ? NaN : Number(String(r.rate));
      if (Number.isFinite(n)) map.set(r.cityId, n);
    }
    return map;
  }, [rates, top?.fromCurrency, top?.toCurrency]);

  const historyRows = useMemo(() => {
    // API returns asc; show newest first + delta vs previous
    const rows = (history || []).map((h: any, idx: number) => {
      const v = h?.rate == null ? null : Number(String(h.rate));
      const prev = idx > 0 ? Number(String(history[idx - 1].rate)) : null;
      const delta = v != null && prev != null ? v - prev : null;
      const pct = delta != null && prev != null && prev !== 0 ? (delta / prev) * 100 : null;
      const date = h.validatedAt || h.createdAt;
      return { id: h.id, v, prev, delta, pct, date };
    });
    return rows.reverse();
  }, [history]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Taux de change</h1>
        <p className="text-slate-300/80">Moyenne journalière du marché parallèle</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-300/70">{top?.fromCurrency || '—'}</div>
            <div className="text-2xl font-semibold text-white">1 {top?.fromCurrency || ''}</div>
          </div>
          <div className="text-slate-300/60">↔</div>
          <div className="text-right">
            <div className="text-xs text-slate-300/70">{top?.toCurrency || '—'} (Moyenne)</div>
            <div className="text-2xl font-semibold text-[#BFEFFF]">
              {rateValue != null ? rateValue.toFixed(0) : '—'} {top?.toCurrency || ''}
            </div>
          </div>
        </div>
      </Card>

      {historyRows.length > 1 && (
        <Card className="p-5">
          <div className="text-white font-semibold mb-3">
            Historique du taux ({top?.fromCurrency} → {top?.toCurrency})
          </div>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-slate-300/70 bg-white/5">
              <div className="col-span-6">Date</div>
              <div className="col-span-3 text-right">Taux</div>
              <div className="col-span-3 text-right">Variation</div>
            </div>
            <div className="divide-y divide-white/10">
              {historyRows.slice(0, 20).map((r: any) => {
                const delta = r.delta as number | null;
                const pct = r.pct as number | null;
                const isUp = delta != null && delta > 0;
                const isDown = delta != null && delta < 0;
                const cls = isUp ? 'text-[#CE1126]' : isDown ? 'text-emerald-300' : 'text-slate-300/70';
                const deltaText =
                  delta == null
                    ? '—'
                    : `${delta > 0 ? '▲ +' : delta < 0 ? '▼ -' : '— '}${Math.abs(delta).toFixed(0)} ${top?.toCurrency}` +
                      (pct != null ? ` (${pct > 0 ? '+' : ''}${pct.toFixed(1)}%)` : '');
                const date = r.date ? new Date(r.date).toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
                return (
                  <div key={r.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-sm">
                    <div className="col-span-6 text-slate-300/80">{date}</div>
                    <div className="col-span-3 text-right text-white">
                      {r.v != null ? `${Math.round(r.v)} ${top?.toCurrency}` : '—'}
                    </div>
                    <div className={`col-span-3 text-right ${cls}`}>{deltaText}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <div className="flex-1">
          <Input placeholder="Rechercher une ville…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select
          value={selectedCityId}
          onChange={(e) => {
            const next = e.target.value;
            setSelectedCityId(next);
            const qs = new URLSearchParams(searchParams.toString());
            if (next) qs.set('cityId', next);
            else qs.delete('cityId');
            const suffix = qs.toString() ? `?${qs.toString()}` : '';
            router.replace(`/app/rates${suffix}`);
          }}
          className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 focus:ring-2 focus:ring-[#00A3E0] focus:border-transparent"
        >
          <option value="">Toutes les villes</option>
          {cities.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.nameFr} ({c.province?.nameFr})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredCities.map((c: any) => {
          const cityRateValue = rateByCityIdForTopPair.get(c.id) ?? null;
          
          return (
            <Link key={c.id} href={`/app/city/${c.id}`}>
              <Card className="p-3 hover:bg-white/10 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <img
                    src={c.imageUrl || svgThumb(c.nameFr || 'Ville', '#1F4DFF')}
                    alt={c.nameFr || 'Ville'}
                    className="h-16 w-24 rounded-xl object-cover ring-1 ring-white/10 bg-white/5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-white">{c.nameFr}</div>
                    <div className="text-sm text-[#BFEFFF] font-semibold">
                      Taux {top?.fromCurrency || '—'}→{top?.toCurrency || '—'} :{' '}
                      {cityRateValue != null ? `${cityRateValue.toFixed(0)} ${top?.toCurrency || ''}` : '—'}
                    </div>
                    <div className="text-xs text-slate-300/70">
                      {c.province?.nameFr} • {c.markets?.length ?? 0} marchés
                    </div>
                  </div>
                  <div className="text-slate-300/60">›</div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


