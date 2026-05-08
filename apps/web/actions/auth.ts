'use server';

import {
  canonicalizeRole,
  getPortalAccessError,
  getPortalLoginPath,
  getPostLoginPath,
  isAdminRole,
  isDriverRole,
  type AuthPortal,
} from '@/lib/auth/portal';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function resolveRoleCandidate(...values: Array<unknown>) {
  const ignoredRoles = new Set(['authenticated', 'anon', 'service_role', 'supabase_admin']);
  const visited = new WeakSet<object>();

  const pickRole = (value: unknown, depth = 0): string | null => {
    if (depth > 5) {
      return null;
    }

    if (typeof value === 'string') {
      const normalized = canonicalizeRole(value);
      if (!normalized || ignoredRoles.has(normalized)) {
        return null;
      }
      return normalized;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = pickRole(item, depth + 1);
        if (found) {
          return found;
        }
      }
      return null;
    }

    if (value && typeof value === 'object') {
      if (visited.has(value as object)) {
        return null;
      }
      visited.add(value as object);

      const candidateRecord = value as Record<string, unknown>;
      const nestedRole = pickRole(candidateRecord.role ?? candidateRecord.user_role ?? candidateRecord.userRole, depth + 1);
      if (nestedRole) {
        return nestedRole;
      }

      for (const nestedValue of Object.values(candidateRecord)) {
        const found = pickRole(nestedValue, depth + 1);
        if (found) {
          return found;
        }
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

function resolveEffectiveRole(
  profileRole: string | null,
  appMetadataRole: string | null,
  userMetadataRole: string | null
) {
  const profileCanonical = canonicalizeRole(profileRole);
  const appCanonical = canonicalizeRole(appMetadataRole);
  const userCanonical = canonicalizeRole(userMetadataRole);

  if (profileCanonical && (isAdminRole(profileCanonical) || isDriverRole(profileCanonical))) {
    return profileCanonical;
  }

  if (appCanonical && (isAdminRole(appCanonical) || isDriverRole(appCanonical))) {
    return appCanonical;
  }

  if (profileCanonical) {
    return profileCanonical;
  }

  return appCanonical ?? userCanonical;
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
    const payload = {
      id: userId,
      email,
      full_name: email.split('@')[0],
      role: toProfileRole(fallbackRole),
    };

    // Create profile with inferred role if it doesn't exist
    const { error: insertError } = await supabase.from('profiles').insert(payload);

    if (insertError) {
      try {
        const adminSupabase = createAdminClient();
        await adminSupabase.from('profiles').upsert(payload, { onConflict: 'id' });
      } catch {
        // no-op: portal checks below will still deny access if profile remains missing
      }
    }
  }
}

async function syncPrivilegedProfileRole(userId: string, appMetadataRole: string | null) {
  const appCanonical = canonicalizeRole(appMetadataRole);
  if (!appCanonical || (!isAdminRole(appCanonical) && !isDriverRole(appCanonical))) {
    return;
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  const profileCanonical = canonicalizeRole(profile?.role ?? null);
  if (profileCanonical && (isAdminRole(profileCanonical) || isDriverRole(profileCanonical))) {
    return;
  }

  try {
    const adminSupabase = createAdminClient();
    await adminSupabase
      .from('profiles')
      .update({ role: toProfileRole(appCanonical) })
      .eq('id', userId);
  } catch {
    // no-op
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

  const appMetadataRole = resolveRoleCandidate(
    data.user.app_metadata,
    data.user.app_metadata?.role,
    data.user.app_metadata?.user_role
  );
  const userMetadataRole = resolveRoleCandidate(data.user.user_metadata, data.user.user_metadata?.role);

  // Ensure profile exists
  await ensureProfileExists(data.user.id, email, appMetadataRole ?? userMetadataRole);
  await syncPrivilegedProfileRole(data.user.id, appMetadataRole);

  const profileRole = await getProfileRole(data.user.id);
  const role = resolveEffectiveRole(profileRole, appMetadataRole, userMetadataRole);
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
