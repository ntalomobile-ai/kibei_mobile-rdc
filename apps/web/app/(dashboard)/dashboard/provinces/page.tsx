'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks';
import { useTranslation } from '@/hooks';
import { createAdminProvince, fetchAdminProvinces } from '@/lib/api';
import { Badge, Button, Card, ErrorAlert, Input, Loading } from '@kibei/ui';
import { formatDate } from '@kibei/utils';

export default function AdminProvincesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [provinces, setProvinces] = useState<any[]>([]);

  const [code, setCode] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameSw, setNameSw] = useState('');
  const [nameLn, setNameLn] = useState('');
  const [capitalCity, setCapitalCity] = useState('');
  const [population, setPopulation] = useState('');

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const p = await fetchAdminProvinces();
      setProvinces(p.data || []);
    } catch {
      setError("Impossible de charger les provinces (droits admin requis).");
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

  if (!user) return <Loading />;
  if (loading) return <Loading />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('admin.provinces')}</h1>
        <p className="text-slate-300/80">Créer et consulter les provinces.</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Créer une province</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Code</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="LBA" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Capitale (optionnel)</label>
            <Input value={capitalCity} onChange={(e) => setCapitalCity(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Nom FR</label>
            <Input value={nameFr} onChange={(e) => setNameFr(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Population (optionnel)</label>
            <Input
              value={population}
              onChange={(e) => setPopulation(e.target.value)}
              type="number"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Nom SW</label>
            <Input value={nameSw} onChange={(e) => setNameSw(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Nom LN</label>
            <Input value={nameLn} onChange={(e) => setNameLn(e.target.value)} />
          </div>
        </div>

        <div className="mt-4">
          <Button
            disabled={!code || !nameFr || !nameSw || !nameLn}
            onClick={async () => {
              setError('');
              try {
                await createAdminProvince({
                  code,
                  nameFr,
                  nameSw,
                  nameLn,
                  capitalCity: capitalCity || undefined,
                  population: population ? Number(population) : undefined,
                });
                setCode('');
                setNameFr('');
                setNameSw('');
                setNameLn('');
                setCapitalCity('');
                setPopulation('');
                await reload();
              } catch (err: any) {
                setError(err.message || 'Création impossible (vérifie le code unique et les champs).');
              }
            }}
          >
            Créer
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Provinces</h2>
        <div className="space-y-3">
          {provinces.map((p) => (
            <div key={p.id} className="border border-white/10 bg-white/5 rounded-lg p-3 flex justify-between gap-4">
              <div>
                <p className="font-semibold text-white">
                  {p.nameFr} ({p.code})
                </p>
                <p className="text-sm text-slate-300/80">
                  {p.capitalCity ? `Capitale: ${p.capitalCity}` : '—'}{' '}
                  {p.population ? `• Pop: ${p.population}` : ''}
                </p>
                <p className="text-xs text-slate-300/70">Créée le {formatDate(p.createdAt)}</p>
              </div>
              <div className="text-right space-y-2">
                {p.isPilot && <Badge variant="success">pilot</Badge>}
                {p._count && (
                  <div className="text-xs text-slate-300/70">
                    {p._count.cities} villes • {p._count.users} users
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


