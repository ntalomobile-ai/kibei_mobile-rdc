'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchPrices, fetchProvinces } from '@/lib/api';
import { Card, Input, Loading, ErrorAlert, Badge } from '@kibei/ui';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function PublicHomePage() {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prices, setPrices] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [p, prov] = await Promise.all([fetchPrices(), fetchProvinces()]);
        setPrices(p.data || []);
        setProvinces(prov.data || []);
      } catch {
        setError("Impossible de charger les données publiques.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const trending = useMemo(() => {
    const seen = new Set<string>();
    const out: any[] = [];
    for (const item of prices) {
      const key = item.productId;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
      if (out.length >= 6) break;
    }
    return out;
  }, [prices]);

  const filteredProvinces = useMemo(() => {
    if (!q.trim()) return provinces;
    const s = q.trim().toLowerCase();
    return provinces.filter((p: any) => p.nameFr?.toLowerCase().includes(s) || p.code?.toLowerCase().includes(s));
  }, [provinces, q]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <div>
            <h1 className="text-2xl font-semibold text-white">KiBei RDC</h1>
            <p className="text-slate-300/80">Suivi des prix en temps réel</p>
          </div>
        </div>

        <div className="mt-4">
          <Input
            placeholder="Rechercher un produit, un marché…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Link href="/app/rates">
            <Card className="px-4 py-3 hover:bg-white/10 transition cursor-pointer">
              <div className="text-sm text-slate-300/70">Taux</div>
              <div className="text-white font-semibold">Voir</div>
            </Card>
          </Link>
          <Link href="/app/explore">
            <Card className="px-4 py-3 hover:bg-white/10 transition cursor-pointer">
              <div className="text-sm text-slate-300/70">Explorer</div>
              <div className="text-white font-semibold">Prix</div>
            </Card>
          </Link>
          <Link href="/app/report">
            <Card className="px-4 py-3 hover:bg-white/10 transition cursor-pointer">
              <div className="text-sm text-slate-300/70">Signaler</div>
              <div className="text-white font-semibold">Prix</div>
            </Card>
          </Link>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-white">Tendances</h2>
          <Link href="/app/explore" className="text-sm text-slate-300/80 hover:text-white">
            Voir tout
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trending.map((p: any) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-white font-semibold">{p.product?.nameFr}</div>
                  <div className="text-xs text-slate-300/70 mt-1">
                    {p.market?.nameFr} • {p.market?.city?.nameFr}
                  </div>
                </div>
                <Badge variant="default">
                  {String(p.price)} {p.currency}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white mb-3">Par Province</h2>
        <div className="space-y-3">
          {filteredProvinces.map((p: any) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold">{p.nameFr}</div>
                  <div className="text-xs text-slate-300/70">
                    {p.cities?.length ?? 0} villes •{' '}
                    {(p.cities || []).reduce((acc: number, c: any) => acc + (c.markets?.length ?? 0), 0)} marchés
                  </div>
                </div>
                <span className="text-slate-300/60 text-sm">{p.code}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


