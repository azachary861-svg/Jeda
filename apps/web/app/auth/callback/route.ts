import { NextResponse } from 'next/server';
import { getPortalAccessError, getPortalLoginPath, getPostLoginPath, type AuthPortal } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const intent = searchParams.get('intent');
  const portal: AuthPortal = intent === 'admin' ? 'admin' : intent === 'driver' ? 'driver' : 'client';
  const nextPath = searchParams.get('next');

  const loginUrl = new URL(getPortalLoginPath(portal), origin);

  if (nextPath) {
    loginUrl.searchParams.set('next', nextPath);
  }

  // Handle OAuth errors
  if (error) {
    loginUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(loginUrl);
  }

  // Handle successful OAuth callback
  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      loginUrl.searchParams.set('error', exchangeError.message);
      return NextResponse.redirect(loginUrl);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      loginUrl.searchParams.set('error', 'Sesi login tidak ditemukan.');
      return NextResponse.redirect(loginUrl);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const portalError = getPortalAccessError(portal, profile?.role);

    if (portalError) {
      await supabase.auth.signOut({ scope: 'local' });
      loginUrl.searchParams.set('error', portalError);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(new URL(getPostLoginPath(portal, nextPath), origin));
  }

  // No code or error, redirect to login
  return NextResponse.redirect(loginUrl);
}
