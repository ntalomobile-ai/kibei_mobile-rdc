'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useTranslation } from '@/hooks';
import { fetchAdminReports, updateAdminReport } from '@/lib/api';
import { Badge, Button, Card, ErrorAlert, Loading, Select } from '@kibei/ui';
import { formatDate } from '@kibei/utils';

function formatPrice(price: any, currency: string = 'CDF') {
  const value = Number(price) || 0;
  return new Intl.NumberFormat('fr-FR').format(value) + ' ' + currency;
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent': return 'danger';
    case 'high': return 'warning';
    case 'normal': return 'default';
    case 'low': return 'secondary';
    default: return 'default';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'open': return 'warning';
    case 'resolved': return 'success';
    case 'dismissed': return 'secondary';
    default: return 'default';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'open': return 'En attente';
    case 'resolved': return 'Traité';
    case 'dismissed': return 'Rejeté';
    default: return status;
  }
}

export default function DashboardReportsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (filter !== 'all') {
        if (filter === 'transmitted') {
          params.transmitted = 'true';
        } else {
          params.status = filter;
        }
      }
      const res = await fetchAdminReports(params);
      setReports(res.data || []);
      setStats(res.stats || null);
    } catch {
      setError('Erreur lors du chargement des signalements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    reload();
  }, [user?.id, filter]);

  const handleTransmit = async (id: string) => {
    setProcessingId(id);
    try {
      await updateAdminReport(id, { transmittedToAuthorities: true });
      await reload();
    } catch {
      setError('Erreur lors de la transmission');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async (id: string) => {
    setProcessingId(id);
    try {
      await updateAdminReport(id, { status: 'resolved' });
      await reload();
    } catch {
      setError('Erreur lors de la mise à jour');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async (id: string) => {
    setProcessingId(id);
    try {
      await updateAdminReport(id, { status: 'dismissed' });
      await reload();
    } catch {
      setError('Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  if (!user) return <Loading />;
  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🛡️ Signalements Citoyens</h1>
        <p className="text-slate-300/80">
          Gérez les signalements de prix élevés soumis par les citoyens et transmettez-les aux autorités.
        </p>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-[#FCD116]">
              {stats.byStatus?.open || 0}
            </div>
            <div className="text-sm text-slate-300/70">En attente</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-emerald-400">
              {stats.byStatus?.resolved || 0}
            </div>
            <div className="text-sm text-slate-300/70">Traités</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-[#00A3E0]">
              {stats.transmitted || 0}
            </div>
            <div className="text-sm text-slate-300/70">Transmis aux autorités</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-white">
              {stats.total || 0}
            </div>
            <div className="text-sm text-slate-300/70">Total</div>
          </Card>
        </div>
      )}

      {/* Filtres */}
      <div className="flex gap-3 flex-wrap">
        {['all', 'open', 'resolved', 'dismissed', 'transmitted'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm transition ${
              filter === f
                ? 'bg-white/10 border-white/20 text-white'
                : 'bg-white/5 border-white/10 text-slate-300/80 hover:bg-white/10'
            } border`}
          >
            {f === 'all' ? 'Tous' : 
             f === 'open' ? '🟡 En attente' :
             f === 'resolved' ? '✅ Traités' :
             f === 'dismissed' ? '❌ Rejetés' :
             '🏛️ Transmis'}
          </button>
        ))}
      </div>

      {/* Liste des signalements */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <div className="text-white font-medium">Aucun signalement</div>
            <div className="text-sm text-slate-300/70">
              {filter === 'all' 
                ? "Il n'y a pas encore de signalements citoyens."
                : "Aucun signalement avec ce filtre."}
            </div>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Informations principales */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {report.product?.nameFr || 'Produit inconnu'}
                      </h3>
                      <p className="text-sm text-slate-300/70">
                        {report.market?.nameFr} — {report.market?.city?.nameFr}, {report.market?.city?.province?.nameFr}
                      </p>
                    </div>
                  </div>

                  {/* Prix signalé */}
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-xs text-slate-300/60">Prix signalé</div>
                      <div className="text-xl font-bold text-[#CE1126]">
                        {formatPrice(report.observedPrice, report.currency)}
                      </div>
                    </div>
                    <div className="text-sm text-slate-300/70">
                      / {report.product?.unitFr || 'unité'}
                    </div>
                  </div>

                  {/* Raison */}
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-xs text-slate-300/60 mb-1">Motif du signalement</div>
                    <p className="text-sm text-white/90">{report.reasonFr}</p>
                  </div>

                  {/* Métadonnées */}
                  <div className="flex flex-wrap gap-4 text-xs text-slate-300/60">
                    <span>📅 {formatDate(report.createdAt)}</span>
                    <span>👤 {report.reportedBy?.fullName || 'Anonyme'}</span>
                    {report.transmittedAt && (
                      <span className="text-[#00A3E0]">
                        🏛️ Transmis le {formatDate(report.transmittedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions et badges */}
                <div className="flex flex-col gap-3 min-w-[200px]">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={getStatusColor(report.status) as any}>
                      {getStatusLabel(report.status)}
                    </Badge>
                    {report.transmittedToAuthorities && (
                      <Badge variant="default">🏛️ Transmis</Badge>
                    )}
                  </div>

                  {report.status === 'open' && (
                    <div className="space-y-2">
                      {!report.transmittedToAuthorities && (
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={processingId === report.id}
                          onClick={() => handleTransmit(report.id)}
                        >
                          🏛️ Transmettre aux autorités
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled={processingId === report.id}
                        onClick={() => handleResolve(report.id)}
                      >
                        ✅ Marquer traité
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full"
                        disabled={processingId === report.id}
                        onClick={() => handleDismiss(report.id)}
                      >
                        ❌ Rejeter
                      </Button>
                    </div>
                  )}

                  {report.status !== 'open' && report.resolvedNotes && (
                    <div className="text-xs text-slate-300/70 bg-white/5 rounded p-2">
                      <strong>Note:</strong> {report.resolvedNotes}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

