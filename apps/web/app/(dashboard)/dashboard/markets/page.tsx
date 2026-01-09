'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation, useUser } from '@/hooks';
import {
  createAdminMarket,
  deleteAdminMarket,
  fetchAdminMarkets,
  fetchAdminCities,
  updateAdminMarket,
} from '@/lib/api';
import { Badge, Button, Card, ErrorAlert, Input, Loading, Select } from '@kibei/ui';

export default function AdminMarketsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markets, setMarkets] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [cityId, setCityId] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameSw, setNameSw] = useState('');
  const [nameLn, setNameLn] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCityId, setEditCityId] = useState('');
  const [editNameFr, setEditNameFr] = useState('');
  const [editNameSw, setEditNameSw] = useState('');
  const [editNameLn, setEditNameLn] = useState('');

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const [m, c] = await Promise.all([fetchAdminMarkets(), fetchAdminCities()]);
      setMarkets(m.data || []);
      setCities(c.data || []);
    } catch {
      setError("Impossible de charger les marchés (droits admin requis).");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const cityOptions = useMemo(
    () => cities.map((c: any) => ({ id: c.id, label: `${c.nameFr} — ${c.province?.nameFr || 'Province'}` })),
    [cities]
  );

  if (!user) return <Loading />;
  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('admin.markets') || 'Marchés'}</h1>
        <p className="text-slate-300/80">Créer, modifier et gérer les images des marchés.</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Créer un marché</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-slate-200">Ville</label>
            <Select value={cityId} onChange={(e) => setCityId(e.target.value)}>
              <option value="">Sélectionner…</option>
              {cityOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Nom FR</label>
            <Input value={nameFr} onChange={(e) => setNameFr(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Nom SW</label>
            <Input value={nameSw} onChange={(e) => setNameSw(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Nom LN</label>
            <Input value={nameLn} onChange={(e) => setNameLn(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Image (URL)</label>
            <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>
        </div>

        <div className="mt-4">
          <Button
            disabled={!cityId || !nameFr || !nameSw || !nameLn}
            onClick={async () => {
              setError('');
              try {
                await createAdminMarket({
                  cityId,
                  nameFr,
                  nameSw,
                  nameLn,
                  imageUrl: imageUrl || undefined,
                });
                setCityId('');
                setNameFr('');
                setNameSw('');
                setNameLn('');
                setImageUrl('');
                await reload();
              } catch (err: any) {
                setError(err.message || 'Création impossible (vérifie les champs).');
              }
            }}
          >
            Créer
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Marchés</h2>
        <div className="space-y-3">
          {markets.map((m) => (
            <div
              key={m.id}
              className="border border-white/10 bg-white/5 rounded-lg p-3 flex justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">
                  {m.nameFr}{' '}
                  <span className="text-slate-300/70 text-sm">
                    — {m.city?.nameFr || 'Ville'} ({m.city?.province?.nameFr || 'Province'})
                  </span>
                </p>
                <p className="text-xs text-slate-300/70 mt-1">
                  Prix: {m._count?.prices ?? 0}
                </p>

                {editingId === m.id ? (
                  <div className="mt-3 space-y-3 p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs text-slate-200 mb-1">Ville</label>
                        <Select value={editCityId} onChange={(e) => setEditCityId(e.target.value)}>
                          <option value="">Sélectionner…</option>
                          {cityOptions.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-200 mb-1">Nom FR</label>
                        <Input
                          value={editNameFr}
                          onChange={(e) => setEditNameFr(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-200 mb-1">Nom SW</label>
                        <Input
                          value={editNameSw}
                          onChange={(e) => setEditNameSw(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-200 mb-1">Nom LN</label>
                        <Input
                          value={editNameLn}
                          onChange={(e) => setEditNameLn(e.target.value)}
                        />
                      </div>
                      {/* Note: Le modèle Market n'a pas de champ imageUrl */}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        disabled={!editCityId || !editNameFr || !editNameSw || !editNameLn}
                        onClick={async () => {
                          setError('');
                          try {
                            const payload: any = {
                              cityId: editCityId.trim(),
                              nameFr: editNameFr.trim(),
                              nameSw: editNameSw.trim(),
                              nameLn: editNameLn.trim(),
                            };
                            // Note: imageUrl n'existe pas dans le modèle Market, on ne l'envoie pas
                            await updateAdminMarket(m.id, payload);
                            setEditingId(null);
                            setEditCityId('');
                            setEditNameFr('');
                            setEditNameSw('');
                            setEditNameLn('');
                            await reload();
                          } catch (err: any) {
                            setError(err.message || "Mise à jour impossible.");
                          }
                        }}
                      >
                        Enregistrer
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(null);
                          setEditCityId('');
                          setEditNameFr('');
                          setEditNameSw('');
                          setEditNameLn('');
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingId(m.id);
                        setEditCityId(m.cityId || '');
                        setEditNameFr(m.nameFr || '');
                        setEditNameSw(m.nameSw || '');
                        setEditNameLn(m.nameLn || '');
                      }}
                    >
                      Modifier
                    </Button>
                    {m.isActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          setError('');
                          try {
                            await updateAdminMarket(m.id, { isActive: false });
                            await reload();
                          } catch (err: any) {
                            setError(err.message || "Désactivation impossible.");
                          }
                        }}
                      >
                        Désactiver
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={async () => {
                          setError('');
                          try {
                            await updateAdminMarket(m.id, { isActive: true });
                            await reload();
                          } catch (err: any) {
                            setError(err.message || "Activation impossible.");
                          }
                        }}
                      >
                        Activer
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        setError('');
                        try {
                          await deleteAdminMarket(m.id);
                          await reload();
                        } catch (err: any) {
                          setError(err.message || "Suppression impossible (supprime d'abord les prix de ce marché).");
                        }
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <Badge variant={m.isActive ? 'success' : 'danger'}>
                  {m.isActive ? 'actif' : 'inactif'}
                </Badge>
                <Badge variant={m.imageUrl ? 'success' : 'warning'} className="mt-1 block">
                  {m.imageUrl ? 'image' : 'sans image'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

