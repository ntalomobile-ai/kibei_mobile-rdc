import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  // Avoid 404 for browsers requesting /favicon.ico; redirect to the real SVG.
  return NextResponse.redirect(new URL('/favicon.svg', request.url), 307);
}


