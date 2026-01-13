'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMyReports } from '@/lib/api';
import { useUser } from '@/hooks';
import { Badge, Card, ErrorAlert, Loading } from '@kibei/ui';
import { formatDate } from '@kibei/utils';
import Link from 'next/link';

function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffHour < 24) return `il y a ${diffHour}h`;
  if (diffDay < 7) return `il y a ${diffDay} jour${diffDay > 1 ? 's' : ''}`;
  if (diffWeek < 4) return `il y a ${diffWeek} semaine${diffWeek > 1 ? 's' : ''}`;
  if (diffMonth < 12) return `il y a ${diffMonth} mois`;
  return formatDate(date);
}

function formatPrice(price: any, currency: string = 'CDF') {
  const value = Number(price) || 0;
  return new Intl.NumberFormat('fr-FR').format(value) + ' ' + currency;
}

function getStatusInfo(status: string, transmitted: boolean) {
  if (transmitted) {
    return {
      label: 'Transmis aux autorités',
      color: 'default' as const,
      icon: '🏛️',
      step: 3,
    };
  }
  switch (status) {
    case 'open':
      return {
        label: 'En cours de traitement',
        color: 'warning' as const,
        icon: '⏳',
        step: 2,
      };
    case 'resolved':
      return {
        label: 'Traité',
        color: 'success' as const,
        icon: '✅',
        step: 4,
      };
    case 'dismissed':
      return {
        label: 'Classé sans suite',
        color: 'default' as const,
        icon: '📁',
        step: 4,
      };
    default:
      return {
        label: status,
        color: 'default' as const,
        icon: '📋',
        step: 1,
      };
  }
}

interface TimelineStepProps {
  number: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  icon: string;
}

function TimelineStep({ number, title, description, completed, current, icon }: TimelineStepProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
            completed
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : current
              ? 'bg-[#FCD116]/20 text-[#FCD116] border border-[#FCD116]/30 animate-pulse'
              : 'bg-white/5 text-slate-400 border border-white/10'
          }`}
        >
          {completed ? '✓' : icon}
        </div>
      </div>
      <div className="flex-1 pb-4">
        <div
          className={`text-sm font-medium ${
            completed ? 'text-emerald-400' : current ? 'text-[#FCD116]' : 'text-slate-400'
          }`}
        >
          {title}
        </div>
        <div className="text-xs text-slate-400/80">{description}</div>
      </div>
    </div>
  );
}

export default function MyReportsPage() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/login?redirect=/app/my-reports');
      return;
    }

    async function load() {
      setLoading(true);
      try {
        const res = await fetchMyReports();
        setReports(res.data || []);
        setStats(res.stats || null);
      } catch {
        setError('Erreur lors du chargement de vos signalements');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id, userLoading]);

  if (userLoading || loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">📋 Mes Signalements</h1>
        <p className="text-slate-300/80">
          Suivez l'état de vos signalements de prix et leur traitement par les autorités.
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Statistiques personnelles */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-slate-300/70">Total</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-[#FCD116]">{stats.open}</div>
            <div className="text-xs text-slate-300/70">En cours</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-[#00A3E0]">{stats.transmitted}</div>
            <div className="text-xs text-slate-300/70">Transmis</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.resolved}</div>
            <div className="text-xs text-slate-300/70">Traités</div>
          </Card>
        </div>
      )}

      {/* Bouton pour faire un nouveau signalement */}
      <div className="flex justify-center">
        <Link
          href="/app/report"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00A3E0] to-[#1F4DFF] text-white font-medium hover:opacity-90 transition"
        >
          ➕ Faire un nouveau signalement
        </Link>
      </div>

      {/* Liste des signalements */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Aucun signalement
            </h3>
            <p className="text-sm text-slate-300/70 mb-4">
              Vous n'avez pas encore fait de signalement de prix.
            </p>
            <Link
              href="/app/report"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#00A3E0] text-white font-medium hover:bg-[#00A3E0]/80 transition"
            >
              🚨 Signaler un prix
            </Link>
          </Card>
        ) : (
          reports.map((report) => {
            const statusInfo = getStatusInfo(report.status, report.transmittedToAuthorities);
            const isExpanded = expandedId === report.id;

            return (
              <Card
                key={report.id}
                className="overflow-hidden"
              >
                <div className="p-5">
                  {/* En-tête */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {report.product?.imageUrl ? (
                        <img
                          src={report.product.imageUrl}
                          alt={report.product.nameFr}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                          🛒
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {report.product?.nameFr || 'Produit inconnu'}
                        </h3>
                        <p className="text-sm text-slate-300/70">
                          {report.market?.nameFr} — {report.market?.city?.nameFr}
                        </p>
                        <div className="text-xs text-slate-400 mt-1">
                          Signalé {timeAgo(report.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant={statusInfo.color}>
                        {statusInfo.icon} {statusInfo.label}
                      </Badge>
                      <div className="text-lg font-bold text-[#CE1126] mt-2">
                        {formatPrice(report.observedPrice, report.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Contenu étendu */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 border-t border-white/10 space-y-5">
                      {/* Timeline de suivi */}
                      <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-white mb-4">
                          📍 Suivi de votre signalement
                        </h4>
                        <div className="space-y-0">
                          <TimelineStep
                            number={1}
                            title="Réception confirmée"
                            description="Votre signalement a été reçu et enregistré"
                            completed={true}
                            current={false}
                            icon="1"
                          />
                          <TimelineStep
                            number={2}
                            title="Vérification par les modérateurs"
                            description="Notre équipe examine votre signalement"
                            completed={statusInfo.step >= 2}
                            current={statusInfo.step === 2 && !report.transmittedToAuthorities}
                            icon="2"
                          />
                          <TimelineStep
                            number={3}
                            title="Transmission aux autorités"
                            description="Envoyé aux autorités économiques compétentes"
                            completed={report.transmittedToAuthorities}
                            current={report.transmittedToAuthorities && report.status === 'open'}
                            icon="3"
                          />
                          <TimelineStep
                            number={4}
                            title="Publication et actions correctives"
                            description="Mesures prises pour corriger la situation"
                            completed={report.status === 'resolved'}
                            current={false}
                            icon="4"
                          />
                        </div>
                      </div>

                      {/* Détails */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400/80">Produit</div>
                          <div className="text-white">
                            {report.product?.nameFr} ({report.product?.unitFr})
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400/80">Catégorie</div>
                          <div className="text-white">{report.product?.category || '—'}</div>
                        </div>
                        <div>
                          <div className="text-slate-400/80">Marché</div>
                          <div className="text-white">{report.market?.nameFr}</div>
                        </div>
                        <div>
                          <div className="text-slate-400/80">Localisation</div>
                          <div className="text-white">
                            {report.market?.city?.nameFr}, {report.market?.city?.province?.nameFr}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400/80">Date du signalement</div>
                          <div className="text-white">{formatDate(report.createdAt)}</div>
                        </div>
                        {report.transmittedAt && (
                          <div>
                            <div className="text-slate-400/80">Transmis le</div>
                            <div className="text-[#00A3E0]">{formatDate(report.transmittedAt)}</div>
                          </div>
                        )}
                        {report.resolvedAt && (
                          <div>
                            <div className="text-slate-400/80">Résolu le</div>
                            <div className="text-emerald-400">{formatDate(report.resolvedAt)}</div>
                          </div>
                        )}
                      </div>

                      {/* Motif */}
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-xs text-slate-400/80 mb-1">Votre motif</div>
                        <p className="text-sm text-white/90">{report.reasonFr}</p>
                      </div>

                      {/* Notes de résolution */}
                      {report.resolvedNotes && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                          <div className="text-xs text-emerald-400 mb-1">Réponse des autorités</div>
                          <p className="text-sm text-white/90">{report.resolvedNotes}</p>
                        </div>
                      )}

                      {/* Message de statut */}
                      <div className={`rounded-lg p-4 text-center ${
                        report.status === 'resolved'
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : report.transmittedToAuthorities
                          ? 'bg-[#00A3E0]/10 border border-[#00A3E0]/20'
                          : 'bg-[#FCD116]/10 border border-[#FCD116]/20'
                      }`}>
                        <div className="text-2xl mb-2">
                          {report.status === 'resolved' ? '🎉' : report.transmittedToAuthorities ? '🏛️' : '⏳'}
                        </div>
                        <div className={`text-sm font-medium ${
                          report.status === 'resolved'
                            ? 'text-emerald-400'
                            : report.transmittedToAuthorities
                            ? 'text-[#00A3E0]'
                            : 'text-[#FCD116]'
                        }`}>
                          {report.status === 'resolved'
                            ? 'Votre signalement a été traité avec succès !'
                            : report.transmittedToAuthorities
                            ? 'Votre signalement a été transmis aux autorités économiques.'
                            : 'Votre signalement est en cours de traitement.'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {report.status === 'resolved'
                            ? 'Merci pour votre contribution citoyenne.'
                            : 'Vous serez notifié de toute mise à jour.'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bouton pour voir les détails */}
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedId(isExpanded ? null : report.id);
                      }}
                      className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2"
                    >
                      {isExpanded ? (
                        <>
                          <span>▲</span>
                          <span>Réduire</span>
                        </>
                      ) : (
                        <>
                          <span>▼</span>
                          <span>Voir les détails</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Message d'encouragement */}
      {reports.length > 0 && (
        <Card className="p-5 text-center bg-gradient-to-br from-[#00A3E0]/10 to-[#1F4DFF]/10 border-[#00A3E0]/20">
          <div className="text-2xl mb-2">🙏</div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Merci pour votre engagement citoyen !
          </h3>
          <p className="text-sm text-slate-300/80">
            Grâce à des citoyens comme vous, nous luttons ensemble contre la spéculation
            et les hausses abusives des prix.
          </p>
        </Card>
      )}
    </div>
  );
}

