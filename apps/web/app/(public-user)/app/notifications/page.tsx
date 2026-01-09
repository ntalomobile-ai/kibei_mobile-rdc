'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchNotifications } from '@/lib/api';
import { Card, ErrorAlert, Loading } from '@kibei/ui';
import { svgThumb } from '../_components/thumb';
import Link from 'next/link';

function formatMoney(v: any, currency: string) {
  const n = v == null ? null : Number(String(v));
  if (!Number.isFinite(n as number)) return `— ${currency}`;
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n as number) + ` ${currency}`;
}

function formatPct(pct: number | null) {
  if (pct == null) return '';
  const sign = pct > 0 ? '+' : '';
  return ` (${sign}${pct.toFixed(1)}%)`;
}

function formatDelta(delta: number | null, currency: string, pct: number | null) {
  if (delta == null) return { text: '—', cls: 'text-slate-300/70' };
  if (delta > 0) return { text: `▲ ${formatMoney(delta, currency)}${formatPct(pct)}`, cls: 'text-[#CE1126]' };
  if (delta < 0) return { text: `▼ ${formatMoney(Math.abs(delta), currency)}${formatPct(pct)}`, cls: 'text-emerald-300' };
  return { text: `— 0 ${currency}`, cls: 'text-slate-300/70' };
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

// Gérer les notifications masquées via localStorage
function getHiddenNotifications(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const hidden = localStorage.getItem('hiddenNotifications');
    return hidden ? new Set(JSON.parse(hidden)) : new Set();
  } catch {
    return new Set();
  }
}

function hideNotification(notificationId: string) {
  if (typeof window === 'undefined') return;
  try {
    const hidden = getHiddenNotifications();
    hidden.add(notificationId);
    localStorage.setItem('hiddenNotifications', JSON.stringify([...hidden]));
    // Déclencher un événement personnalisé pour mettre à jour le comptage dans le layout
    window.dispatchEvent(new Event('notificationHidden'));
  } catch {
    // Silently fail
  }
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Charger les IDs masqués au montage
    setHiddenIds(getHiddenNotifications());
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetchNotifications(30);
        setItems(res.data || []);
        // Marquer les notifications comme vues dans le localStorage
        localStorage.setItem('lastNotificationCheck', new Date().toISOString());
      } catch {
        setError("Impossible de charger les notifications.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleHide = (notificationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    hideNotification(notificationId);
    setHiddenIds(prev => new Set([...prev, notificationId]));
  };

  const handleClearAll = () => {
    if (typeof window === 'undefined') return;
    const allIds = items.map(n => `${n.type}-${n.id}`);
    try {
      localStorage.setItem('hiddenNotifications', JSON.stringify(allIds));
      setHiddenIds(new Set(allIds));
      // Déclencher un événement personnalisé pour mettre à jour le comptage dans le layout
      window.dispatchEvent(new Event('notificationHidden'));
    } catch {
      // Silently fail
    }
  };

  const list = useMemo(() => {
    return items
      .filter(n => !hiddenIds.has(`${n.type}-${n.id}`))
      .slice(0, 30);
  }, [items, hiddenIds]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Notifications</h1>
          <p className="text-sm text-slate-300/80">
            Restez informé de l&apos;évolution des prix.
          </p>
        </div>
        {list.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 rounded-lg text-xs bg-white/5 hover:bg-white/10 text-slate-300/80 hover:text-white ring-1 ring-white/10 hover:ring-white/20 transition-all"
          >
            Tout effacer
          </button>
        )}
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="space-y-3">
        {list.map((n: any) => {
          if (n.type === 'rate') {
            const currency = n.toCurrency || '';
            const deltaInfo = formatDelta(n.delta ?? null, currency, n.pct ?? null);
            const notificationId = `rate-${n.id}`;
            const cityName = n.city?.nameFr || '';
            const provinceName = n.city?.province?.nameFr || '';
            
            const params = new URLSearchParams();
            if (n.city?.id) params.set('cityId', n.city.id);
            if (n.fromCurrency) params.set('fromCurrency', String(n.fromCurrency));
            if (n.toCurrency) params.set('toCurrency', String(n.toCurrency));
            const href = `/app/rates${params.toString() ? `?${params.toString()}` : ''}`;

            return (
              <div key={notificationId} className="relative group">
                <button
                  onClick={(e) => handleHide(notificationId, e)}
                  className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 flex items-center justify-center text-slate-300/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Masquer"
                >
                  ×
                </button>
                <Link href={href}>
                  <Card className="p-4 hover:bg-white/10 transition cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-semibold text-white">
                          Taux {n.fromCurrency} → {n.toCurrency}
                          {cityName && (
                            <span className="text-slate-300/70 font-normal">
                              {' '}• {cityName}
                              {provinceName ? `, ${provinceName}` : ''}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-300/80 mt-1">
                          {n.rate != null ? `${Math.round(Number(n.rate))} ${n.toCurrency}` : '—'}
                          {n.previousRate != null ? (
                            <span className="text-slate-300/70">
                              {' '}
                              (avant: {Math.round(Number(n.previousRate))} {n.toCurrency})
                            </span>
                          ) : null}
                        </div>
                        <div className={`text-sm mt-1 ${deltaInfo.cls}`}>
                          {deltaInfo.text} depuis la dernière validation
                        </div>
                        <div className="text-xs text-slate-300/70 mt-2">
                          Validé le {formatDateTime(n.validatedAt || n.createdAt)}
                        </div>
                      </div>
                      <div className="h-14 w-20 rounded-xl ring-1 ring-white/10 bg-white/5 grid place-items-center text-[#BFEFFF] font-semibold">
                        $
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            );
          }

          // price
          const currency = n.currency || 'CDF';
          const deltaInfo = formatDelta(n.delta ?? null, currency, n.pct ?? null);
          const productName = n.product?.nameFr || 'Produit';
          const marketName = n.market?.nameFr || 'Marché';
          const cityName = n.market?.city?.nameFr || '';
          const detailsHref = `/app/item/${encodeURIComponent(n.id)}`;
          const notificationId = `price-${n.id}`;

          return (
            <div key={notificationId} className="relative group">
              <button
                onClick={(e) => handleHide(notificationId, e)}
                className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 flex items-center justify-center text-slate-300/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                aria-label="Masquer"
              >
                ×
              </button>
              <Link href={detailsHref}>
                <Card className="p-4 hover:bg-white/10 transition cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {productName}{' '}
                        <span className="text-slate-300/70 font-normal">
                          • {marketName}
                          {cityName ? `, ${cityName}` : ''}
                        </span>
                      </div>
                      <div className="text-sm text-slate-300/80 mt-1">
                        {formatMoney(n.price, currency)}
                        {n.previousPrice != null ? (
                          <span className="text-slate-300/70">
                            {' '}
                            (avant: {formatMoney(n.previousPrice, currency)})
                          </span>
                        ) : null}
                      </div>
                      <div className={`text-sm mt-1 ${deltaInfo.cls}`}>
                        {deltaInfo.text} depuis la dernière validation
                      </div>
                      <div className="text-xs text-slate-300/70 mt-2">
                        Validé le {formatDateTime(n.validatedAt || n.createdAt)}
                      </div>
                    </div>
                    <img
                      src={n.product?.imageUrl || svgThumb(productName, '#1F4DFF')}
                      alt={productName}
                      className="h-14 w-20 rounded-xl object-cover ring-1 ring-white/10 bg-white/5"
                    />
                  </div>
                </Card>
              </Link>
            </div>
          );
        })}
        {list.length === 0 && (
          <Card className="p-6 text-center">
            <div className="text-slate-300/70 mb-2">🔔</div>
            <div className="text-sm text-slate-300/70">Aucune notification pour le moment.</div>
            <div className="text-xs text-slate-300/50 mt-1">
              Les nouvelles variations de prix apparaîtront ici.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}


