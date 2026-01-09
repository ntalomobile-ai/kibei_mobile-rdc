'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchMarketById, fetchPrices } from '@/lib/api';
import { ErrorAlert, Loading } from '@kibei/ui';
import { svgThumb } from '../../_components/thumb';

function toNumber(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  const n = Number(String(v));
  return Number.isFinite(n) ? n : 0;
}

function formatFC(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FC';
}

type MarketRow = {
  latest: any;
  previous: any | null;
  delta: number;
};

export default function PublicMarketPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [market, setMarket] = useState<any>(null);
  const [prices, setPrices] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [m, p] = await Promise.all([fetchMarketById(id), fetchPrices(id)]);
        setMarket(m.data);
        setPrices(p.data || []);
      } catch {
        setError('Marché introuvable.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const rows = useMemo<MarketRow[]>(() => {
    // prices are already ordered desc by createdAt
    const byProduct = new Map<string, any[]>();
    for (const pr of prices) {
      const pid = pr.productId;
      if (!pid) continue;
      const arr = byProduct.get(pid) || [];
      arr.push(pr);
      byProduct.set(pid, arr);
    }

    const out: MarketRow[] = [];
    for (const arr of byProduct.values()) {
      const latest = arr[0];
      const previous = arr[1] || null;
      const delta = latest && previous ? toNumber(latest.price) - toNumber(previous.price) : 0;
      out.push({ latest, previous, delta });
    }

    out.sort((a, b) => (a.latest?.product?.nameFr || '').localeCompare(b.latest?.product?.nameFr || ''));
    return out;
  }, [prices]);

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} />;
  if (!market) return <ErrorAlert message="Marché introuvable." />;

  const marketName = market.nameFr || 'Marché';
  const cityName = market.city?.nameFr || '';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
          aria-label="Retour"
        >
          ←
        </button>
        <div>
          <div className="text-2xl font-semibold text-white">{marketName}</div>
          <div className="text-slate-300/70">{cityName ? `(${cityName})` : ''}</div>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map(({ latest, previous, delta }) => {
          const productName = latest.product?.nameFr || 'Produit';
          const price = toNumber(latest.price);

          const isUp = delta > 0;
          const isDown = delta < 0;
          const abs = Math.abs(delta);

          const deltaLabel = previous
            ? isUp
              ? `▲ ${formatFC(abs)} depuis hier`
              : isDown
                ? `▼ ${formatFC(abs)} depuis hier`
                : `— 0 FC depuis hier`
            : '—';

          const deltaClass = isUp
            ? 'text-[#CE1126]'
            : isDown
              ? 'text-emerald-300'
              : 'text-slate-300/70';

          return (
            <Link key={latest.id} href={`/app/item/${latest.id}`}>
              <div className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 cursor-pointer">
                <div className="flex items-center gap-4">
                  <img
                    src={latest.product?.imageUrl || svgThumb(productName)}
                    alt={productName}
                    className="h-16 w-16 rounded-2xl ring-1 ring-white/10 bg-white/5 object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold truncate">{productName}</div>
                    <div className="text-white text-xl font-semibold mt-1">{formatFC(price)}</div>
                    <div className={`text-sm mt-1 ${deltaClass}`}>{deltaLabel}</div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {rows.length === 0 && (
          <div className="text-sm text-slate-300/70">Aucun prix disponible pour ce marché.</div>
        )}
      </div>
    </div>
  );
}


