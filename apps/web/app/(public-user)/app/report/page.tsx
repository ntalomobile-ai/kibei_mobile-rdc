'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchMarkets, fetchProducts, submitPriceReport } from '@/lib/api';
import { Button, Card, ErrorAlert, Input, Loading, Select, SuccessAlert, TextArea } from '@kibei/ui';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PublicReportPage() {
  const sp = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);

  const [productId, setProductId] = useState('');
  const [marketId, setMarketId] = useState('');
  const [priceValue, setPriceValue] = useState('');
  const [currency, setCurrency] = useState('CDF');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [p, m] = await Promise.all([fetchProducts(), fetchMarkets()]);
        setProducts(p.data || []);
        setMarkets(m.data || []);
      } catch {
        setError('Impossible de charger les listes.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const pid = sp.get('productId');
    const mid = sp.get('marketId');
    const cur = sp.get('currency');
    if (pid) setProductId(pid);
    if (mid) setMarketId(mid);
    if (cur) setCurrency(cur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const canSubmit = useMemo(() => {
    return productId && marketId && Number(priceValue) > 0;
  }, [productId, marketId, priceValue]);

  if (loading) return <Loading />;

  // Afficher une page de succès complète après le signalement
  if (success) {
  return (
    <div className="space-y-6">
        {/* Animation de succès */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center animate-pulse">
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="absolute -inset-2 rounded-full border-4 border-emerald-500/30 animate-ping" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mt-6 text-center">
            Signalement envoyé avec succès !
          </h1>
          <p className="text-slate-300/80 mt-2 text-center max-w-sm">
            Merci pour votre contribution citoyenne à la transparence économique en RDC.
          </p>
        </div>

        {/* Carte d'information sur le traitement */}
        <Card className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
      <div>
                <h3 className="font-semibold text-white">Votre signalement est en cours de traitement</h3>
                <p className="text-sm text-slate-300/70">Numéro de suivi généré automatiquement</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="h-8 w-8 rounded-full bg-[#00A3E0]/20 flex items-center justify-center text-sm">1</div>
                <div className="flex-1">
                  <div className="text-sm text-white">Réception confirmée</div>
                  <div className="text-xs text-emerald-400">✓ Complété</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <div className="h-8 w-8 rounded-full bg-[#FCD116]/20 flex items-center justify-center text-sm">2</div>
                <div className="flex-1">
                  <div className="text-sm text-white">Vérification par les modérateurs</div>
                  <div className="text-xs text-[#FCD116]">⏳ En cours...</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 opacity-60">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-sm">3</div>
                <div className="flex-1">
                  <div className="text-sm text-white">Transmission aux autorités</div>
                  <div className="text-xs text-slate-300/60">En attente</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 opacity-60">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-sm">4</div>
                <div className="flex-1">
                  <div className="text-sm text-white">Publication et actions correctives</div>
                  <div className="text-xs text-slate-300/60">En attente</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Message d'encouragement */}
        <Card className="p-5 bg-[#0B1220]/80 border-white/10">
          <div className="flex items-start gap-4">
            <div className="text-3xl">🇨🇩</div>
            <div className="space-y-2">
              <h3 className="font-semibold text-white">Votre action fait la différence !</h3>
              <p className="text-sm text-slate-300/80">
                Grâce à des citoyens engagés comme vous, nous pouvons ensemble lutter contre 
                la spéculation et les hausses abusives des prix. Les autorités économiques 
                seront informées de votre signalement dans les plus brefs délais.
              </p>
            </div>
          </div>
        </Card>

        {/* Statistiques d'impact */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center bg-white/5">
            <div className="text-2xl font-bold text-[#00A3E0]">24h</div>
            <div className="text-xs text-slate-300/70 mt-1">Délai moyen de traitement</div>
          </Card>
          <Card className="p-4 text-center bg-white/5">
            <div className="text-2xl font-bold text-[#FCD116]">100%</div>
            <div className="text-xs text-slate-300/70 mt-1">Signalements examinés</div>
          </Card>
          <Card className="p-4 text-center bg-white/5">
            <div className="text-2xl font-bold text-emerald-400">Direct</div>
            <div className="text-xs text-slate-300/70 mt-1">Lien avec autorités</div>
          </Card>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-3">
          <Button 
            className="w-full" 
            onClick={() => {
              setSuccess('');
              setProductId('');
              setMarketId('');
            }}
          >
            📝 Faire un autre signalement
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.location.href = '/app'}
          >
            🏠 Retour à l'accueil
          </Button>
        </div>

        <p className="text-center text-xs text-slate-300/50">
          Vous recevrez une notification lorsque votre signalement sera traité.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec message d'impact */}
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-white">🛡️ Signaler un prix</h1>
        <p className="text-slate-300/80">
          Contribuez à la transparence des prix et à la stabilité économique en RDC.
        </p>
      </div>

      {/* Bannière d'information citoyenne */}
      <Card className="p-5 bg-gradient-to-r from-[#00A3E0]/10 via-[#FCD116]/10 to-[#CE1126]/10 border-white/20">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🏛️</div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-white">Votre voix compte !</h3>
            <p className="text-sm text-slate-300/90">
              Chaque signalement est <strong className="text-white">transmis aux autorités compétentes</strong> pour 
              permettre une intervention rapide et maintenir la stabilité économique dans nos marchés.
            </p>
          </div>
        </div>
      </Card>

      {/* Objectifs du signalement */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-xl mb-1">⚖️</div>
          <div className="text-xs text-slate-300/80">Stabilité économique</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-xl mb-1">🚫</div>
          <div className="text-xs text-slate-300/80">Lutte anti-spéculation</div>
        </div>
        <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
          <div className="text-xl mb-1">📊</div>
          <div className="text-xs text-slate-300/80">Contrôle des prix</div>
        </div>
      </div>

      {error && <ErrorAlert message={error} />}
      
      {/* Message de succès élaboré */}
      {success && (
        <Card className="p-6 space-y-5 bg-gradient-to-br from-emerald-500/10 to-[#00A3E0]/10 border-emerald-500/20">
          <div className="text-center">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-white mb-2">
              Signalement envoyé avec succès !
            </h2>
            <p className="text-slate-300/80">
              Merci pour votre contribution citoyenne. Votre signalement sera traité dans les plus brefs délais.
            </p>
          </div>

          {/* Timeline de suivi */}
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="text-sm font-medium text-white mb-4">📍 Suivi de votre signalement</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-sm">✓</div>
                <div>
                  <div className="text-sm font-medium text-emerald-400">Réception confirmée</div>
                  <div className="text-xs text-slate-400">Votre signalement a été reçu</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FCD116]/20 text-[#FCD116] border border-[#FCD116]/30 flex items-center justify-center text-sm animate-pulse">2</div>
                <div>
                  <div className="text-sm font-medium text-[#FCD116]">Vérification par les modérateurs</div>
                  <div className="text-xs text-slate-400">En cours...</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 text-slate-400 border border-white/10 flex items-center justify-center text-sm">3</div>
                <div>
                  <div className="text-sm text-slate-400">Transmission aux autorités</div>
                  <div className="text-xs text-slate-500">En attente</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 text-slate-400 border border-white/10 flex items-center justify-center text-sm">4</div>
                <div>
                  <div className="text-sm text-slate-400">Publication et actions correctives</div>
                  <div className="text-xs text-slate-500">En attente</div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/app/my-reports"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#00A3E0] text-white font-medium hover:bg-[#00A3E0]/80 transition"
            >
              📋 Suivre mes signalements
            </Link>
            <button
              onClick={() => setSuccess('')}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition border border-white/10"
            >
              ➕ Faire un autre signalement
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
            Vous recevrez une notification lorsque votre signalement sera traité.
          </div>
        </Card>
      )}

      {!success && <Card className="p-6 space-y-4">
        <div className="text-sm text-slate-300/70 mb-2">
          📝 Remplissez les informations ci-dessous
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-200">Produit</label>
          <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Sélectionner un produit</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nameFr} ({p.category})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-200">Marché / Lieu</label>
          <Select value={marketId} onChange={(e) => setMarketId(e.target.value)}>
            <option value="">Sélectionner le marché</option>
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nameFr} — {m.city?.nameFr}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Prix constaté</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={priceValue}
              onChange={(e) => setPriceValue(e.target.value)}
              placeholder="Ex: 5000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Devise</label>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="CDF">FC (CDF)</option>
              <option value="USD">USD</option>
              <option value="ZMW">ZMW</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-200">
            Détails / Observations (optionnel)
          </label>
          <TextArea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            placeholder="Ex: Prix observé ce matin au marché central, hausse soudaine par rapport à la semaine dernière, stock limité…" 
            rows={3}
          />
        </div>

        {/* Message de traitement */}
        <div className="rounded-xl border border-[#00A3E0]/30 bg-[#00A3E0]/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-[#7DD3FC] font-medium text-sm">
            <span>✓</span>
            <span>Processus de traitement</span>
          </div>
          <ol className="text-xs text-slate-300/80 space-y-1 ml-5 list-decimal">
            <li>Votre signalement est reçu et enregistré immédiatement</li>
            <li>Nos modérateurs vérifient l'exactitude des informations</li>
            <li>Les données sont transmises aux <strong className="text-white">autorités économiques</strong></li>
            <li>Des mesures sont prises pour corriger les abus de prix</li>
          </ol>
        </div>

        {/* Avertissement */}
        <div className="rounded-xl border border-[#FCD116]/25 bg-[#FCD116]/10 p-4 text-sm text-[#FFF0A8]">
          <div className="flex items-start gap-2">
            <span>⚠️</span>
            <div>
              <strong>Important :</strong> Fournissez des informations exactes et vérifiables. 
              Les faux signalements peuvent nuire à l'efficacité du système et sont passibles de sanctions.
            </div>
          </div>
        </div>

        <Button
          className="w-full"
          disabled={!canSubmit}
          onClick={async () => {
            setError('');
            setSuccess('');
            setSubmitting(true);
            try {
              await submitPriceReport({
                productId,
                marketId,
                observedPrice: Number(priceValue),
                currency,
                reason: notes || 'Prix jugé trop élevé par rapport au marché',
              });
              setSuccess('ok');
              setPriceValue('');
              setNotes('');
            } catch {
              setError("Impossible d'envoyer le signalement. Veuillez réessayer.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          🚀 Envoyer mon signalement
        </Button>

        <p className="text-center text-xs text-slate-300/60">
          En soumettant ce signalement, vous contribuez à la lutte contre la spéculation 
          et les hausses exagérées des prix en RDC.
        </p>
      </Card>}

      {/* Section d'impact */}
      {!success && <Card className="p-5 bg-[#0B1220]/80 border-white/10">
        <div className="text-center space-y-3">
          <div className="text-2xl">🇨🇩</div>
          <h3 className="font-semibold text-white">Ensemble pour une économie stable</h3>
          <p className="text-sm text-slate-300/80">
            Grâce aux signalements citoyens, les autorités peuvent identifier rapidement 
            les zones de spéculation et intervenir pour protéger le pouvoir d'achat des Congolais.
          </p>
          <div className="flex justify-center gap-6 pt-2">
            <div className="text-center">
              <div className="text-lg font-bold text-[#00A3E0]">24h</div>
              <div className="text-xs text-slate-300/60">Délai moyen de traitement</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#FCD116]">100%</div>
              <div className="text-xs text-slate-300/60">Signalements examinés</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-[#CE1126]">Direct</div>
              <div className="text-xs text-slate-300/60">Lien avec autorités</div>
            </div>
          </div>
        </div>
      </Card>}
    </div>
  );
}


