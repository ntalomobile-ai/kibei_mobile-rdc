import { NextRequest, NextResponse } from 'next/server';

function getCorsHeaders(req: NextRequest) {
  const allowedOrigin = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
  const origin = req.headers.get('origin');
  const corsOrigin = origin === allowedOrigin ? origin : allowedOrigin;

  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  };
}

export function middleware(req: NextRequest) {
  const headers = getCorsHeaders(req);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  const res = NextResponse.next();
  for (const [k, v] of Object.entries(headers)) {
    res.headers.set(k, v);
  }
  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};


