'use server';

import { getPortalAccessError, getPortalLoginPath, getPostLoginPath, type AuthPortal } from '@/lib/auth/portal';
import { canonicalizeRole, isAdminRole, isDriverRole } from '@/lib/auth/portal';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function resolveRoleCandidate(...values: Array<unknown>) {
  const ignoredRoles = new Set(['authenticated', 'anon', 'service_role', 'supabase_admin']);

  const pickRole = (value: unknown): string | null => {
    if (typeof value === 'string') {
      const normalized = canonicalizeRole(value);
      if (!normalized || ignoredRoles.has(normalized)) {
        return null;
      }
      return normalized;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = pickRole(item);
        if (found) {
          return found;
        }
      }
      return null;
    }

    if (value && typeof value === 'object') {
      const candidateRecord = value as Record<string, unknown>;
      const nestedRole = pickRole(candidateRecord.role ?? candidateRecord.user_role ?? candidateRecord.userRole);
      if (nestedRole) {
        return nestedRole;
      }
    }

    return null;
  };

  for (const value of values) {
    const role = pickRole(value);
    if (role) {
      return role;
    }
  }

  return null;
}

async function getProfileRole(userId: string) {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  return profile?.role ?? null;
}

function toProfileRole(role: string | null): 'super_admin' | 'regional_admin' | 'driver' | 'client' {
  const canonical = canonicalizeRole(role);

  if (!canonical) {
    return 'client';
  }

  if (isDriverRole(canonical)) {
    return 'driver';
  }

  if (isAdminRole(canonical)) {
    return canonical === 'regional_admin' ? 'regional_admin' : 'super_admin';
  }

  return 'client';
}

async function ensureProfileExists(userId: string, email: string, fallbackRole: string | null) {
  const supabase = await createClient();

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!existingProfile) {
    // Create profile with default client role if it doesn't exist
    await supabase.from('profiles').insert({
      id: userId,
      email,
      full_name: email.split('@')[0],
      role: toProfileRole(fallbackRole),
    });
  }
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

  const metadataRole = resolveRoleCandidate(data.user.user_metadata?.role, data.user.app_metadata?.role);

  // Ensure profile exists
  await ensureProfileExists(data.user.id, email, metadataRole);

  const profileRole = await getProfileRole(data.user.id);
  const role = resolveRoleCandidate(profileRole, metadataRole);
  const portalError = getPortalAccessError(portal, role);

  if (portalError) {
    await supabase.auth.signOut({ scope: 'local' });
    return { error: portalError };
  }

  if (data.session) {
    return { success: true, redirectTo: getPostLoginPath(portal, nextPath) };
  }

  return { success: true, redirectTo: getPostLoginPath(portal, nextPath) };
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
    return { url: data.url };
  }

  return { error: `Gagal membuka portal ${getPortalLoginPath(portal)}.` };
}
