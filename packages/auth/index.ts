import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import type { Role } from '@kibei/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-key-min-32-characters'
);

export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  provinceId?: string;
  iat?: number;
  exp?: number;
}

export class AuthError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function signToken(payload: JWTPayload, expiresIn: number = 900) {
  try {
    const token = await new SignJWT(payload as unknown as Record<string, unknown>)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
      .sign(JWT_SECRET);

    return token;
  } catch (error) {
    throw new AuthError('Token signing failed', 'TOKEN_SIGN_FAILED');
  }
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as JWTPayload;
  } catch (error) {
    throw new AuthError('Token verification failed', 'TOKEN_VERIFY_FAILED');
  }
}

export async function setAuthCookie(token: string, refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 900, // 15 minutes
    path: '/',
  });

  cookieStore.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 604800, // 7 days
    path: '/',
  });
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('accessToken')?.value || null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('refreshToken')?.value || null;
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    const token = await getAuthToken();
    if (!token) return null;

    return await verifyToken(token);
  } catch {
    return null;
  }
}

export function isAuthorized(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

export function hashPassword(password: string): string {
  // TODO: Use bcryptjs for production
  // For now, use a simple hash (NOT SECURE FOR PRODUCTION)
  return Buffer.from(password).toString('base64');
}

export function verifyPassword(password: string, hash: string): boolean {
  // TODO: Use bcryptjs for production
  return Buffer.from(password).toString('base64') === hash;
}
