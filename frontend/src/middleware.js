import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // ── Admin routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Protected user routes ─────────────────────────────────────────────────
  const protectedRoutes = ['/my-orders', '/checkout', '/profile'];
  if (protectedRoutes.some(r => pathname.startsWith(r))) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // ── Redirect logged-in users away from auth pages ─────────────────────────
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/my-orders/:path*',
    '/checkout',
    '/profile',
    '/login',
    '/register',
  ],
};
