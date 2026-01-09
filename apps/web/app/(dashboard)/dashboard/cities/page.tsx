'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation, useUser } from '@/hooks';
import {
  createAdminCity,
  deleteAdminCity,
  fetchAdminCities,
  fetchAdminProvinces,
  updateAdminCity,
} from '@/lib/api';
import { Badge, Button, Card, ErrorAlert, Input, Loading, Select } from '@kibei/ui';

export default function AdminCitiesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cities, setCities] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);

  const [provinceId, setProvinceId] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameSw, setNameSw] = useState('');
  const [nameLn, setNameLn] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');
  const [creating, setCreating] = useState(false);

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const [c, p] = await Promise.all([fetchAdminCities(), fetchAdminProvinces()]);
      setCities(c.data || []);
      setProvinces(p.data || []);
    } catch {
      setError("Impossible de charger les villes (droits admin requis).");
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

  const provinceOptions = useMemo(
    () => provinces.map((p: any) => ({ id: p.id, label: `${p.nameFr} (${p.code})` })),
    [provinces]
  );

  if (!user) return <Loading />;
  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('admin.cities')}</h1>
        <p className="text-slate-300/80">Créer, modifier et gérer les images des villes.</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Créer une ville</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-slate-200">Province</label>
            <Select value={provinceId} onChange={(e) => setProvinceId(e.target.value)}>
              <option value="">Sélectionner…</option>
              {provinceOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
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
          {(!provinceId || !nameFr || !nameSw || !nameLn) && (
            <p className="text-xs text-slate-400 mb-2">
              ⚠️ Tous les champs (Province, Nom FR, Nom SW, Nom LN) sont requis
            </p>
          )}
          <Button
            disabled={!provinceId || !nameFr || !nameSw || !nameLn || creating}
            onClick={async () => {
              setError('');
              setCreating(true);
              try {
                const payload: any = {
                  provinceId: provinceId.trim(),
                  nameFr: nameFr.trim(),
                  nameSw: nameSw.trim(),
                  nameLn: nameLn.trim(),
                };
                if (imageUrl && imageUrl.trim()) {
                  payload.imageUrl = imageUrl.trim();
                }
                console.log('Création ville avec payload:', payload);
                await createAdminCity(payload);
                setProvinceId('');
                setNameFr('');
                setNameSw('');
                setNameLn('');
                setImageUrl('');
                await reload();
              } catch (err: any) {
                console.error('Erreur création ville:', err);
                setError(err.message || 'Création impossible (vérifie les champs et que la province existe).');
              } finally {
                setCreating(false);
              }
            }}
          >
            {creating ? 'Création en cours...' : 'Créer'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Villes</h2>
        <div className="space-y-3">
          {cities.map((c) => (
            <div
              key={c.id}
              className="border border-white/10 bg-white/5 rounded-lg p-3 flex justify-between gap-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">
                  {c.nameFr}{' '}
                  <span className="text-slate-300/70 text-sm">
                    — {c.province?.nameFr || 'Province'}
                  </span>
                </p>
                <p className="text-xs text-slate-300/70 mt-1">
                  Marchés: {c._count?.markets ?? 0}
                </p>

                {editingId === c.id ? (
                  <div className="mt-3 space-y-2">
                    <label className="block text-xs text-slate-200">Image URL</label>
                    <Input
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://..."
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          setError('');
                          try {
                            await updateAdminCity(c.id, { imageUrl: editImageUrl ? editImageUrl : null });
                            setEditingId(null);
                            setEditImageUrl('');
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
                          setEditImageUrl('');
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
                        setEditingId(c.id);
                        setEditImageUrl(c.imageUrl || '');
                      }}
                    >
                      Modifier image
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        setError('');
                        try {
                          await deleteAdminCity(c.id);
                          await reload();
                        } catch (err: any) {
                          setError(err.message || "Suppression impossible (supprime d'abord les marchés de cette ville).");
                        }
                      }}
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <Badge variant={c.imageUrl ? 'success' : 'warning'}>
                  {c.imageUrl ? 'image' : 'sans image'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


