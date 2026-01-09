import { NextRequest, NextResponse } from 'next/server';
import { signToken, verifyToken } from '@kibei/auth';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(refreshToken);

    const newAccessToken = await signToken(
      {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        provinceId: payload.provinceId,
      },
      900 // 15 minutes
    );

    const response = NextResponse.json({ success: true });

    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Auth Refresh Error]', error);
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}
