'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser, useTranslation } from '@/hooks';
import { Button, Card, Badge, Loading, ErrorAlert, Input, SuccessAlert } from '@kibei/ui';
import { logoutUser, updateProfile } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { formatDate } from '@kibei/utils';
import { fetchUserStats, uploadProfilePhoto } from '@/lib/api';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getAvatarUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  // If the URL is relative (starts with /), prefix with API URL
  if (url.startsWith('/')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
}

export default function PublicProfilePage() {
  const router = useRouter();
  const { user, logout, setUser } = useUser();
  const { language } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      setError('');
      try {
        const result = await fetchUserStats();
        setStats(result.data || {});
      } catch {
        setError('Impossible de charger les statistiques.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // Initialiser les valeurs d'édition quand l'utilisateur change ou qu'on entre en mode édition
  useEffect(() => {
    if (user && isEditing) {
      setEditFullName(user.fullName || '');
      setEditEmail(user.email || '');
      setEditPhoneNumber(user.phoneNumber || '');
    }
  }, [user, isEditing]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setUploading(true);
    setError('');
    try {
      const result = await uploadProfilePhoto(file);
      // Update user state with new avatar URL
      if (user && result.data?.avatarUrl) {
        setUser({ ...user, avatarUrl: result.data.avatarUrl });
      }
    } catch (err) {
      setError('Erreur lors de l\'upload de la photo. Vérifiez le format et la taille (max 5MB).');
      setAvatarPreview(null);
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    logout();
    router.push('/');
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const updateData: {
        fullName?: string;
        email?: string;
        phoneNumber?: string | null;
      } = {};

      if (editFullName.trim() !== user.fullName) {
        updateData.fullName = editFullName.trim();
      }

      if (editEmail.trim() !== user.email) {
        updateData.email = editEmail.trim();
      }

      const currentPhone = user.phoneNumber || '';
      if (editPhoneNumber.trim() !== currentPhone) {
        updateData.phoneNumber = editPhoneNumber.trim() || null;
      }

      // Si aucun changement, ne rien faire
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        setSaving(false);
        return;
      }

      const result = await updateProfile(updateData);
      
      // Mettre à jour l'utilisateur dans le store
      if (result.user) {
        setUser(result.user);
      }

      setSuccessMessage('Profil mis à jour avec succès');
      setIsEditing(false);

      // Effacer le message de succès après 3 secondes
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  if (loading) return <Loading />;

  const approvalRate = stats?.approvedReports && (stats.approvedReports + stats.rejectedReports) > 0
    ? Math.round((stats.approvedReports / (stats.approvedReports + stats.rejectedReports)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {error && <ErrorAlert message={error} />}
      {successMessage && <SuccessAlert message={successMessage} />}

      {/* Header Card with Avatar and Basic Info */}
      <Card className="p-6 bg-gradient-to-br from-[#00A3E0]/10 to-[#1F4DFF]/10 border-[#00A3E0]/20">
        <div className="flex items-start gap-6">
          <div className="relative">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {/* Avatar with upload button */}
            <button
              onClick={handleAvatarClick}
              disabled={uploading}
              className="relative h-24 w-24 rounded-full overflow-hidden ring-4 ring-[#00A3E0]/20 hover:ring-[#00A3E0]/40 transition-all group cursor-pointer disabled:cursor-wait"
            >
              {avatarPreview || user.avatarUrl ? (
                <img
                  src={avatarPreview || getAvatarUrl(user.avatarUrl) || ''}
                  alt={user.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-[#00A3E0] to-[#1F4DFF] text-white text-3xl font-bold grid place-items-center">
                  {user.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              
              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploading ? (
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </div>
            </button>
            
            {/* Status badge */}
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 grid place-items-center ring-4 ring-[#0B1220]">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{user.fullName}</h2>
            <p className="text-slate-300/70 mb-2">{user.email}</p>
            <p className="text-xs text-slate-300/50 mb-3">Cliquez sur la photo pour la modifier</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{user.role === 'user_public' ? 'Utilisateur Public' : user.role}</Badge>
              <Badge variant={user.isActive ? 'success' : 'danger'}>
                {user.isActive ? 'Actif' : 'Inactif'}
              </Badge>
              {stats?.memberSince && (
                <Badge variant="default">
                  Membre depuis {stats.memberSince} jours
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-[#00A3E0] mb-1">
            {stats?.approvedReports || 0}
          </div>
          <div className="text-sm text-slate-300/70">Prix Approuvés</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-[#FCD116] mb-1">
            {stats?.pendingReports || 0}
          </div>
          <div className="text-sm text-slate-300/70">En Attente</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-[#CE1126] mb-1">
            {stats?.rejectedReports || 0}
          </div>
          <div className="text-sm text-slate-300/70">Rejetés</div>
        </Card>

        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-emerald-400 mb-1">
            {approvalRate}%
          </div>
          <div className="text-sm text-slate-300/70">Taux d'Approbation</div>
        </Card>
      </div>

      {/* Lien vers Mes Signalements */}
      <Link href="/app/my-reports">
        <Card className="p-5 cursor-pointer hover:border-[#00A3E0]/30 transition group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#00A3E0]/20 to-[#1F4DFF]/20 border border-[#00A3E0]/30 flex items-center justify-center text-2xl">
                📋
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white group-hover:text-[#00A3E0] transition">
                  Mes Signalements
                </h3>
                <p className="text-sm text-slate-300/70">
                  Suivez l'état de vos signalements de prix
                </p>
              </div>
            </div>
            <div className="text-slate-400 group-hover:text-[#00A3E0] transition">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Card>
      </Link>

      {/* Achievements / Badges */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🏆 Accomplissements</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.approvedReports >= 1 && (
            <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl mb-2">🌟</div>
              <div className="text-sm font-medium text-white">Premier Pas</div>
              <div className="text-xs text-slate-300/70">1er prix approuvé</div>
            </div>
          )}
          {stats?.approvedReports >= 10 && (
            <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-sm font-medium text-white">Contributeur</div>
              <div className="text-xs text-slate-300/70">10 prix approuvés</div>
            </div>
          )}
          {stats?.approvedReports >= 50 && (
            <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl mb-2">💎</div>
              <div className="text-sm font-medium text-white">Expert</div>
              <div className="text-xs text-slate-300/70">50 prix approuvés</div>
            </div>
          )}
          {approvalRate >= 80 && stats?.approvedReports >= 5 && (
            <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-sm font-medium text-white">Précis</div>
              <div className="text-xs text-slate-300/70">{approvalRate}% approuvé</div>
            </div>
          )}
          {stats?.recentReports >= 5 && (
            <div className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-sm font-medium text-white">Actif</div>
              <div className="text-xs text-slate-300/70">{stats.recentReports} cette semaine</div>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      {stats?.recentActivities && stats.recentActivities.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Activité Récente</h3>
          <div className="space-y-3">
            {stats.recentActivities.slice(0, 5).map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <div className="font-medium text-white">{activity.product?.nameFr}</div>
                  <div className="text-sm text-slate-300/70">
                    {activity.market?.nameFr} • {activity.market?.city?.nameFr}
                  </div>
                  <div className="text-xs text-slate-300/60">{formatDate(activity.createdAt)}</div>
                </div>
                <Badge
                  variant={
                    activity.status === 'approved'
                      ? 'success'
                      : activity.status === 'rejected'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {activity.status === 'approved' ? 'Approuvé' : activity.status === 'rejected' ? 'Rejeté' : 'En attente'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Account Details */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">ℹ️ Détails du Compte</h3>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleStartEdit}>
              ✏️ Modifier
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={saving}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Nom complet
              </label>
              <Input
                type="text"
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />
              <p className="text-xs text-slate-300/70 mt-1">
                L'email est requis pour les informations et communications
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Numéro de téléphone (optionnel)
              </label>
              <Input
                type="tel"
                value={editPhoneNumber}
                onChange={(e) => setEditPhoneNumber(e.target.value)}
                placeholder="+243 900 000 000"
              />
              <p className="text-xs text-slate-300/70 mt-1">
                Vous pourrez vous connecter avec votre nom complet ou ce numéro
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-slate-300/70">Nom complet</span>
              <span className="text-white font-medium">{user.fullName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-slate-300/70">Email</span>
              <span className="text-white font-medium">{user.email}</span>
            </div>
            {user.phoneNumber && (
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-slate-300/70">Téléphone</span>
                <span className="text-white font-medium">{user.phoneNumber}</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-slate-300/70">Membre depuis</span>
              <span className="text-white font-medium">
                {stats?.joinedDate ? formatDate(stats.joinedDate) : '—'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/10">
              <span className="text-slate-300/70">Langue</span>
              <span className="text-white font-medium">
                {language === 'fr' ? 'Français' : language === 'sw' ? 'Swahili' : 'Lingala'}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-300/70">Statut du compte</span>
              <Badge variant={user.isActive ? 'success' : 'danger'}>
                {user.isActive ? 'Actif' : 'Inactif'}
              </Badge>
            </div>
          </div>
        )}
      </Card>

      {/* Logout Button */}
      <Button variant="destructive" className="w-full" onClick={handleLogout}>
        Déconnexion
      </Button>

      <div className="text-center text-xs text-slate-300/60">Version 1.0.0</div>
    </div>
  );
}
