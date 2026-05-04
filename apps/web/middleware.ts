import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  getPortalHomePath,
  isAdminLoginPath,
  isAdminProtectedPath,
  isAdminRole,
  isClientLoginPath,
  isClientProtectedPath,
  isDriverLoginPath,
  isDriverProtectedPath,
  isDriverRole,
  isRegisterPath,
} from '@/lib/auth/portal';

type CookieToSet = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: 'lax' | 'strict' | 'none';
    secure?: boolean;
  };
};

export async function middleware(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasValidSupabaseConfig = Boolean(
      supabaseUrl && /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl) && supabaseAnonKey
    );

    if (!hasValidSupabaseConfig) {
      return NextResponse.next();
    }

    const validatedSupabaseUrl = supabaseUrl as string;
    const validatedSupabaseAnonKey = supabaseAnonKey as string;

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      validatedSupabaseUrl,
      validatedSupabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: CookieToSet[]) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;
    const search = request.nextUrl.search;
    const nextPath = `${pathname}${search}`;
    const wantsAdminLogin = isAdminLoginPath(pathname);
    const wantsDriverLogin = isDriverLoginPath(pathname);
    const wantsClientAuth = isClientLoginPath(pathname) || isRegisterPath(pathname);
    const wantsAdminRoute = isAdminProtectedPath(pathname);
    const wantsClientRoute = isClientProtectedPath(pathname);
    const wantsDriverRoute = isDriverProtectedPath(pathname);

    if (!user && wantsAdminRoute) {
      const loginUrl = new URL('/admin', request.url);
      loginUrl.searchParams.set('next', nextPath);
      return NextResponse.redirect(loginUrl);
    }

    if (!user && wantsClientRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', nextPath);
      return NextResponse.redirect(loginUrl);
    }

    if (!user && wantsDriverRoute) {
      const loginUrl = new URL('/driver', request.url);
      loginUrl.searchParams.set('next', nextPath);
      return NextResponse.redirect(loginUrl);
    }

    if (!user) {
      return supabaseResponse;
    }

    if (user && (wantsAdminRoute || wantsAdminLogin || wantsClientAuth || wantsDriverRoute || wantsDriverLogin)) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        const homePath = getPortalHomePath(isAdminRole(profile?.role) ? 'admin' : isDriverRole(profile?.role) ? 'driver' : 'client');

        if (wantsAdminLogin || wantsClientAuth || wantsDriverLogin) {
          return NextResponse.redirect(new URL(homePath, request.url));
        }

        if (wantsAdminRoute && !isAdminRole(profile?.role)) {
          return NextResponse.redirect(new URL('/packages', request.url));
        }

        if (wantsDriverRoute && !isDriverRole(profile?.role)) {
          return NextResponse.redirect(new URL('/packages', request.url));
        }
      } catch (error) {
        console.error('Middleware auth check failed:', error);
        if (wantsAdminRoute) {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
        if (wantsDriverRoute) {
          return NextResponse.redirect(new URL('/driver', request.url));
        }
        if (wantsAdminLogin || wantsClientAuth || wantsDriverLogin) {
          return supabaseResponse;
        }
      }
    }

    return supabaseResponse;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
