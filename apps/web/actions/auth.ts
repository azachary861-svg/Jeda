'use server';

import { getPortalAccessError, getPortalLoginPath, getPostLoginPath, type AuthPortal } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function getProfileRole(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  return profile?.role ?? null;
}

export async function signInWithEmail(email: string, password: string, portal: AuthPortal, nextPath?: string | null) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: 'Gagal membaca data akun.' };
  }

  const role = await getProfileRole(data.user.id);
  const portalError = getPortalAccessError(portal, role);

  if (portalError) {
    await supabase.auth.signOut({ scope: 'local' });
    return { error: portalError };
  }

  if (data.session) {
    redirect(getPostLoginPath(portal, nextPath));
  }

  return { success: true };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    return { success: true, message: 'Check your email for verification link' };
  }

  return { error: 'Unknown error occurred' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: 'local' });
  redirect('/');
}

export async function signInWithOAuth(provider: 'google' | 'github', portal: AuthPortal, nextPath?: string | null) {
  const supabase = await createClient();
  const callbackUrl = new URL('/auth/callback', process.env.NEXT_PUBLIC_APP_URL);

  callbackUrl.searchParams.set('intent', portal);

  if (nextPath) {
    callbackUrl.searchParams.set('next', nextPath);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url as never);
  }

  return { error: `Gagal membuka portal ${getPortalLoginPath(portal)}.` };
}
