'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks';
import { useTranslation } from '@/hooks';
import { createAdminUser, disableAdminUser, fetchAdminProvinces, fetchAdminUsers, updateAdminUser } from '@/lib/api';
import { Badge, Button, Card, ErrorAlert, Input, Loading, Select } from '@kibei/ui';
import { formatDate } from '@kibei/utils';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user_public' | 'collector' | 'moderator' | 'admin'>('collector');
  const [provinceId, setProvinceId] = useState('');

  const reload = async () => {
    setLoading(true);
    setError('');
    try {
      const [u, p] = await Promise.all([fetchAdminUsers(), fetchAdminProvinces()]);
      setUsers(u.data || []);
      setProvinces(p.data || []);
    } catch {
      setError("Impossible de charger les utilisateurs (droits admin requis).");
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
        <h1 className="text-3xl font-bold mb-2">{t('admin.users')}</h1>
        <p className="text-slate-300/80">Créer et consulter les utilisateurs.</p>
      </div>

      {error && <ErrorAlert message={error} />}

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Créer un utilisateur</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">{t('auth.email')}</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Nom complet</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">{t('auth.password')}</label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Rôle</label>
            <Select value={role} onChange={(e) => setRole(e.target.value as any)}>
              <option value="user_public">user_public</option>
              <option value="collector">collector</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-200">Province (optionnel)</label>
            <Select value={provinceId} onChange={(e) => setProvinceId(e.target.value)}>
              <option value="">—</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameFr} ({p.code})
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <Button
            disabled={!email || !fullName || password.length < 8}
            onClick={async () => {
              setError('');
              try {
                await createAdminUser({
                  email,
                  fullName,
                  password,
                  role,
                  provinceId: provinceId || undefined,
                });
                setEmail('');
                setFullName('');
                setPassword('');
                setProvinceId('');
                await reload();
              } catch {
                setError("Création impossible (vérifie l'email unique et les champs).");
              }
            }}
          >
            Créer
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Utilisateurs</h2>
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.id} className="border border-white/10 bg-white/5 rounded-lg p-3 flex justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{u.fullName}</p>
                <p className="text-sm text-slate-300/80 break-all">{u.email}</p>
                <p className="text-xs text-slate-300/70">
                  Créé le {formatDate(u.createdAt)} {u.province?.nameFr ? `• ${u.province.nameFr}` : ''}
                </p>
              </div>
              <div className="text-right space-y-2 min-w-[220px]">
                <div className="flex justify-end gap-2">
                  <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'active' : 'disabled'}</Badge>
                  <Badge variant="default">{u.role}</Badge>
                </div>

                <div className="flex justify-end gap-2">
                  <Select
                    value={u.role}
                    onChange={async (e) => {
                      const nextRole = e.target.value as any;
                      setError('');
                      try {
                        await updateAdminUser(u.id, { role: nextRole });
                        await reload();
                      } catch {
                        setError("Impossible de modifier le rôle (droits admin requis).");
                      }
                    }}
                    className="max-w-[140px]"
                  >
                    <option value="user_public">user_public</option>
                    <option value="collector">collector</option>
                    <option value="moderator">moderator</option>
                    <option value="admin">admin</option>
                  </Select>

                  {user?.id === u.id ? (
                    <Button size="sm" variant="outline" disabled title="Impossible de se désactiver soi-même">
                      Désactiver
                    </Button>
                  ) : u.isActive ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (!confirm(`Désactiver ${u.email} ?`)) return;
                        setError('');
                        try {
                          await disableAdminUser(u.id);
                          await reload();
                        } catch {
                          setError("Impossible de désactiver l'utilisateur.");
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
                          await updateAdminUser(u.id, { isActive: true });
                          await reload();
                        } catch {
                          setError("Impossible d'activer l'utilisateur.");
                        }
                      }}
                    >
                      Activer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


