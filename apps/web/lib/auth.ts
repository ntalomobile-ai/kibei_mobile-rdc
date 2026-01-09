'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/useStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function loginUser(identifier: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, password }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Login failed');
  }

  return response.json();
}

export async function registerUser(email: string, fullName: string, password: string, phoneNumber?: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, fullName, password, phoneNumber: phoneNumber || undefined }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Registration failed');
  }

  return response.json();
}

export async function logoutUser() {
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function refreshSession() {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Refresh failed');
  }

  return response.json();
}

export async function fetchMe() {
  let response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    credentials: 'include',
  });

  // Access token can expire (15 minutes). Try refresh once, then retry.
  if (response.status === 401) {
    try {
      await refreshSession();
      response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });
    } catch (refreshError) {
      // Si le refresh échoue, le refresh token a probablement expiré
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) throw new Error('Not authenticated');

  return response.json();
}

export async function updateProfile(data: {
  fullName?: string;
  phoneNumber?: string | null;
  email?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erreur lors de la mise à jour du profil');
  }

  return response.json();
}

export function useLoginForm() {
  const router = useRouter();
  const { setUser, setLoading } = useAuth();
  const [identifier, setIdentifier] = useState(''); // email, nom complet ou téléphone
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await loginUser(identifier, password);
      // Prefer user from /auth/me (contains provinceId/marketId), fallback to login payload.
      let resolvedUser: any = data.user;
      try {
        const me = await fetchMe();
        resolvedUser = me.user;
      } catch {
        resolvedUser = data.user;
      }
      setUser(resolvedUser);

      // Public users should use the public app area; dashboard is for staff roles.
      if (resolvedUser?.role === 'user_public') router.push('/app');
      else router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Identifiant ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return { identifier, setIdentifier, password, setPassword, error, handleSubmit };
}

export function useRegisterForm() {
  const router = useRouter();
  const { setUser, setLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation côté client
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    if (!fullName.trim()) {
      setError('Le nom complet est requis');
      setLoading(false);
      return;
    }

    try {
      const data = await registerUser(
        email,
        fullName.trim(),
        password,
        phoneNumber.trim() || undefined
      );
      // Préférer l'utilisateur de /auth/me (contient provinceId/marketId), sinon utiliser les données d'inscription
      let resolvedUser: any = data.user;
      try {
        const me = await fetchMe();
        resolvedUser = me.user;
      } catch {
        resolvedUser = data.user;
      }
      setUser(resolvedUser);

      // Les utilisateurs publics sont redirigés vers /app
      router.push('/app');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    handleSubmit,
  };
}

