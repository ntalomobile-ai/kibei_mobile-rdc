'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPublicPriceById } from '@/lib/api';
import { Button, Card, ErrorAlert, Loading } from '@kibei/ui';
import { formatDate } from '@kibei/utils';
import { svgThumb } from '../../_components/thumb';
import Link from 'next/link';

function toNumber(v: any): number {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return Number(v);
  if (typeof v?.toString === 'function') return Number(v.toString());
  return Number(v);
}

function formatFC(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FC';
}

function formatPct(p: number) {
  const sign = p > 0 ? '+' : '';
  return `${sign}${p.toFixed(1)}%`;
}

function formatDateTime(d: any) {
  const dt = d ? new Date(d) : null;
  if (!dt || Number.isNaN(dt.getTime())) return '';
  return dt.toLocaleString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(d: any) {
  const dt = d ? new Date(d) : null;
  if (!dt || Number.isNaN(dt.getTime())) return '';
  const s = Math.max(0, Math.floor((Date.now() - dt.getTime()) / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const day = Math.floor(h / 24);
  if (day > 0) return `il y a ${day} jour${day > 1 ? 's' : ''}`;
  if (h > 0) return `il y a ${h} heure${h > 1 ? 's' : ''}`;
  if (m > 0) return `il y a ${m} minute${m > 1 ? 's' : ''}`;
  return `à l'instant`;
}

function Sparkline({ values }: { values: number[] }) {
  const w = 300;
  const h = 80;
  const padX = 12;
  const padY = 12;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  // Calculer les points
  const points = values.map((v, i) => ({
    x: padX + (i * (w - padX * 2)) / Math.max(1, values.length - 1),
    y: h - padY - ((v - min) * (h - padY * 2)) / span,
    value: v,
  }));

  // Chemin simple pour la zone remplie
  const areaPath = () => {
    if (points.length < 2) return '';
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    return `${linePath} L ${points[points.length - 1].x} ${h - padY} L ${points[0].x} ${h - padY} Z`;
  };

  // Déterminer la tendance (hausse/baisse)
  const trend = values.length >= 2 ? values[values.length - 1] - values[0] : 0;
  const trendColor = trend >= 0 ? '#CE1126' : '#10B981';

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="area-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={trendColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={trendColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      
      {/* Zone remplie sous la courbe */}
      <path d={areaPath()} fill="url(#area-gradient)" />
      
      {/* Ligne principale */}
      <polyline
        fill="none"
        stroke={trendColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.map(p => `${p.x},${p.y}`).join(' ')}
      />
      
      {/* Points simples */}
      {points.map((p, i) => (
          <circle
            key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill={i === points.length - 1 ? trendColor : '#1e293b'}
          stroke={trendColor}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

export default function PublicItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetchPublicPriceById(params.id);
        setData(res.data);
      } catch {
        setError('Détails indisponibles.');
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const price = data?.price;
  const history = data?.history || [];
  const values = useMemo(() => history.map((h: any) => toNumber(h.price)), [history]);
  const previous = history?.[1] || null;

  const historyRows = useMemo(() => {
    // API returns history asc by createdAt
    const rows = (history as any[]).map((h, idx) => {
      const v = toNumber(h.price);
      const prev = idx > 0 ? toNumber(history[idx - 1].price) : null;
      const delta = prev == null ? null : v - prev;
      const pct = prev && prev !== 0 ? (delta! / prev) * 100 : null;
      const date = h.validatedAt || h.createdAt;
      return { id: h.id, value: v, prev, delta, pct, date };
    });
    // Show newest first in UI
    return rows.reverse();
  }, [history]);

  const latestValue = price?.price != null ? toNumber(price.price) : null;
  const change7d = useMemo(() => {
    if (!price || latestValue == null) return null;
    const latestDate = price.validatedAt || price.createdAt;
    const dt = latestDate ? new Date(latestDate) : null;
    if (!dt || Number.isNaN(dt.getTime())) return null;
    const cutoff = dt.getTime() - 7 * 24 * 60 * 60 * 1000;
    const older = (history as any[]).find((h) => {
      const d = new Date(h.validatedAt || h.createdAt).getTime();
      return d >= 0 && d <= cutoff;
    });
    if (!older) return null;
    const oldVal = toNumber(older.price);
    const delta = latestValue - oldVal;
    const pct = oldVal !== 0 ? (delta / oldVal) * 100 : null;
    return { oldVal, delta, pct };
  }, [history, latestValue, price?.createdAt, price?.validatedAt]);

  const change30d = useMemo(() => {
    if (!price || latestValue == null) return null;
    const latestDate = price.validatedAt || price.createdAt;
    const dt = latestDate ? new Date(latestDate) : null;
    if (!dt || Number.isNaN(dt.getTime())) return null;
    const cutoff = dt.getTime() - 30 * 24 * 60 * 60 * 1000;
    const older = (history as any[]).find((h) => {
      const d = new Date(h.validatedAt || h.createdAt).getTime();
      return d >= 0 && d <= cutoff;
    });
    if (!older) return null;
    const oldVal = toNumber(older.price);
    const delta = latestValue - oldVal;
    const pct = oldVal !== 0 ? (delta / oldVal) * 100 : null;
    return { oldVal, delta, pct };
  }, [history, latestValue, price?.createdAt, price?.validatedAt]);

  if (loading) return <Loading />;
  if (error) return <ErrorAlert message={error} />;
  if (!price) return <ErrorAlert message="Introuvable." />;

  const productName = price.product?.nameFr || 'Produit';
  const cityName = price.market?.city?.nameFr || '';
  const marketName = price.market?.nameFr || '';
  const lastUpdated = price.createdAt;
  const lastValidated = price.validatedAt || price.createdAt;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
          aria-label="Retour"
        >
          ←
        </button>
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-semibold text-white">{productName}</div>
        <div className="text-2xl font-semibold text-white/90">
          {formatFC(toNumber(price.price))}
        </div>
      </div>

      <Link
        href={`/app/report?productId=${encodeURIComponent(price.productId)}&marketId=${encodeURIComponent(price.marketId)}&currency=${encodeURIComponent(price.currency)}`}
      >
        <Button className="w-full" variant="destructive">
          Signaler un prix trop élevé
        </Button>
      </Link>

      <Card className="p-0 overflow-hidden rounded-2xl">
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-white via-slate-100 to-slate-200">
        <img
          src={price.product?.imageUrl || svgThumb(productName)}
          alt={productName}
            className="absolute inset-0 w-full h-full object-cover"
        />
          {/* Overlay subtil en bas pour lisibilité */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </Card>

      <Card className="p-5 space-y-4">
        <div className="text-white font-semibold text-lg">Détails</div>
        
        {/* Informations du produit */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="text-slate-300/70">Produit</div>
            <div className="text-white text-right font-medium">{productName}</div>

            <div className="text-slate-300/70">Catégorie</div>
            <div className="text-white text-right">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/90">
                {price.product?.category || '—'}
              </span>
            </div>

            <div className="text-slate-300/70">Unité de mesure</div>
            <div className="text-white text-right">{price.product?.unitFr || '—'}</div>
          </div>

          {price.product?.descriptionFr && (
            <div className="pt-2 border-t border-white/10">
              <div className="text-slate-300/70 text-xs mb-1">Description</div>
              <div className="text-white/90 text-sm">{price.product.descriptionFr}</div>
            </div>
          )}
        </div>

        {/* Informations de prix */}
        <div className="pt-3 border-t border-white/10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="text-slate-300/70">Prix actuel</div>
            <div className="text-white text-right font-semibold text-base">
              {formatFC(toNumber(price.price))}
              <span className="text-slate-300/70 text-xs font-normal ml-1">
                / {price.product?.unitFr || 'unité'}
              </span>
            </div>

          <div className="text-slate-300/70">Prix précédent</div>
          <div className="text-white text-right">
              {previous ? (
                <>
                  {formatFC(toNumber(previous.price))}
                  {(() => {
                    const curr = toNumber(price.price);
                    const prev = toNumber(previous.price);
                    const diff = curr - prev;
                    const pct = prev !== 0 ? (diff / prev) * 100 : 0;
                    if (diff === 0) return null;
                    return (
                      <span className={`ml-2 text-xs ${diff > 0 ? 'text-[#CE1126]' : 'text-emerald-400'}`}>
                        {diff > 0 ? '▲' : '▼'} {formatPct(pct)}
                      </span>
                    );
                  })()}
                </>
              ) : '—'}
            </div>

            <div className="text-slate-300/70">Devise</div>
            <div className="text-white text-right">{price.currency || 'CDF'}</div>
          </div>
          </div>

        {/* Informations de validation */}
        <div className="pt-3 border-t border-white/10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="text-slate-300/70">Dernière validation</div>
            <div className="text-white text-right">
              <div>{timeAgo(lastValidated)}</div>
              <div className="text-xs text-slate-300/50">{formatDateTime(lastValidated)}</div>
            </div>

            <div className="text-slate-300/70">Source</div>
            <div className="text-white text-right">
              {price.submittedBy?.fullName || 'Collecteur KiBei'}
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-start gap-2">
            <span className="text-lg">📍</span>
            <div>
              <div className="text-white/90 font-medium">{marketName}</div>
              <div className="text-slate-300/70 text-sm">
                {cityName}
                {price.market?.city?.province?.nameFr ? `, ${price.market.city.province.nameFr}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Variations temporelles */}
        {(change7d || change30d) && (
          <div className="pt-3 border-t border-white/10">
            <div className="text-slate-300/70 text-xs mb-2">Évolution des prix</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-300/70 mb-1">7 jours</div>
                <div className={`text-sm font-medium ${
                  change7d?.delta && change7d.delta > 0 ? 'text-[#CE1126]' : 
                  change7d?.delta && change7d.delta < 0 ? 'text-emerald-400' : 'text-white'
                }`}>
                {change7d
                    ? `${change7d.delta >= 0 ? '+' : ''}${formatPct(change7d.pct || 0)}`
                  : '—'}
                </div>
            </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xs text-slate-300/70 mb-1">30 jours</div>
                <div className={`text-sm font-medium ${
                  change30d?.delta && change30d.delta > 0 ? 'text-[#CE1126]' : 
                  change30d?.delta && change30d.delta < 0 ? 'text-emerald-400' : 'text-white'
                }`}>
                {change30d
                    ? `${change30d.delta >= 0 ? '+' : ''}${formatPct(change30d.pct || 0)}`
                  : '—'}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5 bg-[#0B1220]/95 backdrop-blur-xl border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white font-semibold">Historique des prix</div>
          <div className="text-xs text-slate-300/70 bg-white/5 px-2 py-1 rounded-full">
            {values.length} {values.length > 1 ? 'enregistrements' : 'enregistrement'}
          </div>
        </div>

        {/* Graphique d'évolution - affiché seulement avec 3+ points */}
        {values.length >= 3 ? (
          <div className="rounded-xl bg-[#070A12]/60 border border-white/10 p-4 mb-4">
            <div className="h-20">
              <Sparkline values={values} />
            </div>
          </div>
        ) : values.length === 2 ? (
          /* Comparaison visuelle pour 2 points */
          <div className="rounded-xl bg-[#070A12]/60 border border-white/10 p-4 mb-4">
            <div className="flex items-center justify-between gap-4">
              {/* Premier prix */}
              <div className="flex-1 text-center">
                <div className="text-xs text-slate-300/60 mb-1">Ancien prix</div>
                <div className="text-lg font-semibold text-white/80">
                  {formatFC(values[0])}
                </div>
              </div>
              
              {/* Flèche et variation */}
              <div className="flex flex-col items-center px-4">
                {(() => {
                  const diff = values[1] - values[0];
                  const pct = values[0] !== 0 ? (diff / values[0]) * 100 : 0;
                  const isUp = diff > 0;
                  const color = isUp ? 'text-[#CE1126]' : 'text-emerald-400';
                  return (
                    <>
                      <div className={`text-2xl ${color}`}>
                        {isUp ? '→' : '→'}
                      </div>
                      <div className={`text-xs font-medium ${color}`}>
                        {isUp ? '▲' : '▼'} {formatPct(pct)}
                      </div>
                    </>
                  );
                })()}
              </div>
              
              {/* Prix actuel */}
              <div className="flex-1 text-center">
                <div className="text-xs text-slate-300/60 mb-1">Prix actuel</div>
                <div className="text-lg font-semibold text-white">
                  {formatFC(values[1])}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-[#070A12]/60 border border-white/10 p-4 mb-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                📊
              </div>
              <div>
                <div className="text-white/90">Premier enregistrement</div>
                <div className="text-slate-300/60 text-xs">
                  L'évolution sera visible après la prochaine collecte de prix.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-300/70 mb-1">Prix min.</div>
            <div className="text-white font-medium text-sm">
              {values.length ? formatFC(Math.min(...values)) : '—'}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-300/70 mb-1">Prix max.</div>
            <div className="text-white font-medium text-sm">
              {values.length ? formatFC(Math.max(...values)) : '—'}
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-xs text-slate-300/70 mb-1">Moyenne</div>
            <div className="text-white font-medium text-sm">
              {values.length ? formatFC(values.reduce((a: number, b: number) => a + b, 0) / values.length) : '—'}
            </div>
          </div>
        </div>

        {/* Info de dernière validation */}
        <div className="flex items-center justify-between text-xs text-slate-300/70 mb-4 px-1">
          <span>Dernière validation</span>
          <span>{formatDate(lastValidated)}</span>
        </div>

        {/* Tableau de l'historique */}
        <div className="overflow-hidden rounded-xl border border-white/20 bg-[#070A12]/40 backdrop-blur-sm">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-slate-300/70 bg-white/5 backdrop-blur-sm font-medium">
            <div className="col-span-5">Date & Heure</div>
            <div className="col-span-3 text-right">Prix</div>
            <div className="col-span-4 text-right">Variation</div>
          </div>
          {historyRows.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-slate-300/70">
              Aucun historique disponible
            </div>
          ) : (
          <div className="divide-y divide-white/10 bg-[#0B1220]/60">
              {historyRows.map((r: any, idx: number) => {
              const delta = r.delta as number | null;
              const pct = r.pct as number | null;
              const isUp = delta != null && delta > 0;
              const isDown = delta != null && delta < 0;
              const cls = isUp ? 'text-[#CE1126]' : isDown ? 'text-emerald-300' : 'text-slate-300/70';
              const deltaText =
                delta == null
                    ? 'Premier prix'
                    : `${delta > 0 ? '▲ +' : delta < 0 ? '▼ -' : '= '}${formatFC(Math.abs(delta))}` +
                    (pct != null ? ` (${formatPct(pct)})` : '');
              return (
                  <div 
                    key={r.id} 
                    className={`grid grid-cols-12 gap-2 px-3 py-3 text-sm backdrop-blur-sm ${idx === 0 ? 'bg-white/5' : ''}`}
                  >
                    <div className="col-span-5 text-slate-300/80">
                      <div>{formatDateTime(r.date)}</div>
                      {idx === 0 && (
                        <div className="text-xs text-emerald-400 mt-0.5">Actuel</div>
                      )}
                    </div>
                    <div className="col-span-3 text-right text-white font-medium">{formatFC(r.value)}</div>
                    <div className={`col-span-4 text-right ${cls} text-xs`}>{deltaText}</div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Note explicative si peu de données */}
        {values.length < 3 && (
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-2 text-xs">
              <span className="text-amber-400">ℹ️</span>
              <div className="text-amber-200/80">
                <strong>Produit récent :</strong> Ce produit a été ajouté récemment sur ce marché. 
                L'historique s'enrichira au fur et à mesure des collectes de prix.
              </div>
            </div>
        </div>
        )}
      </Card>
    </div>
  );
}


