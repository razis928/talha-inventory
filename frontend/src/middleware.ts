import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/utils/supabase/server';

export async function middleware(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = new URL(request.url).pathname;

  const loginSignupPaths = ['/login', '/signup'];
  const authenticatedPaths = ['/dashboard', '/dashboard/:path*'];

  if (session) {
    if (loginSignupPaths.includes(pathname)) {
      return NextResponse.redirect(
        new URL('/dashboard/settings/payment-details', request.url),
      );
    }
  } else {
    if (authenticatedPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname === '/') {
    return NextResponse.redirect(
      new URL('/dashboard/settings/payment-details', request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/signup'],
};
