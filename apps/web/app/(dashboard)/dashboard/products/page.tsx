'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks';
import { useTranslation } from '@/hooks';
import { createAdminProduct, disableAdminProduct, fetchAdminProducts, updateAdminProduct } from '@/lib/api';
import { Badge, Button, Card, ErrorAlert, Input, Loading } from '@kibei/ui';

export default function AdminProductsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState<any[]>([]);

  const [code, setCode] = useState('');
  const [nameFr, setNameFr] = useState('');
  const [nameSw, setNameSw] = useState('');
  const [nameLn, setNameLn] = useState('');
  const [category, setCategory] = useState('');
  const [unitFr, setUnitFr] = useState('');
  const [unitSw, setUnitSw] = useState('');
  const [unitLn, setUnitLn] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editImageUrl, setEditImageUrl] = useState('');

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const p = await fetchAdminProducts();
      setProducts(p.data || []);
    } catch {
      setError("Impossible de charger les produits (droits admin requis).");
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
        <h1 className="text-3xl font-bold mb-2">{t('admin.products')}</h1>
        <p className="text-slate-300/80">Créer et consulter les produits.</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Créer un produit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Code</label>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="MAIZE" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Catégorie</label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Nom FR</label>
            <Input value={nameFr} onChange={(e) => setNameFr(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Unité FR</label>
            <Input value={unitFr} onChange={(e) => setUnitFr(e.target.value)} placeholder="kg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Nom SW</label>
            <Input value={nameSw} onChange={(e) => setNameSw(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Unité SW</label>
            <Input value={unitSw} onChange={(e) => setUnitSw(e.target.value)} placeholder="kg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Nom LN</label>
            <Input value={nameLn} onChange={(e) => setNameLn(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Unité LN</label>
            <Input value={unitLn} onChange={(e) => setUnitLn(e.target.value)} placeholder="kg" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-slate-200">
              Image du produit (URL)
            </label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
            <p className="text-xs text-slate-300/70 mt-2">
              Colle un lien direct d&apos;image (jpg/png/webp). Optionnel.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Button
            disabled={
              !code || !category || !nameFr || !nameSw || !nameLn || !unitFr || !unitSw || !unitLn
            }
            onClick={async () => {
              setError('');
              try {
                await createAdminProduct({
                  code,
                  category,
                  nameFr,
                  nameSw,
                  nameLn,
                  unitFr,
                  unitSw,
                  unitLn,
                  imageUrl: imageUrl || undefined,
                });
                setCode('');
                setCategory('');
                setNameFr('');
                setNameSw('');
                setNameLn('');
                setUnitFr('');
                setUnitSw('');
                setUnitLn('');
                setImageUrl('');
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
        <h2 className="text-xl font-semibold mb-4 text-white">Produits</h2>
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="border border-white/10 bg-white/5 rounded-lg p-3 flex justify-between gap-4">
              <div>
                <p className="font-semibold text-white">
                  {p.nameFr} <span className="text-slate-300/70 text-sm">({p.code})</span>
                </p>
                <p className="text-sm text-slate-300/80">
                  {p.category} • {p.unitFr}
                </p>
                {editingId === p.id ? (
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
                            await updateAdminProduct(p.id, {
                              imageUrl: editImageUrl ? editImageUrl : null,
                            });
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
                        setEditingId(p.id);
                        setEditImageUrl(p.imageUrl || '');
                      }}
                    >
                      Modifier image
                    </Button>
                    {p.isActive ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          setError('');
                          try {
                            await disableAdminProduct(p.id);
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
                            await updateAdminProduct(p.id, { isActive: true });
                            await reload();
                          } catch (err: any) {
                            setError(err.message || "Activation impossible.");
                          }
                        }}
                      >
                        Activer
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right">
                <Badge variant={p.isActive ? 'success' : 'danger'}>{p.isActive ? 'active' : 'inactive'}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


