import { NextResponse } from 'next/server';
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

export async function GET(request: Request) {
  try {
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
      try {
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

        const metadataRole = resolveRoleCandidate(
          user.user_metadata,
          user.app_metadata,
          user.user_metadata?.role,
          user.app_metadata?.role,
          user.app_metadata?.user_role
        );

        // Ensure profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          const payload = {
            id: user.id,
            email: user.email || 'unknown@example.com',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            role: toProfileRole(metadataRole),
          };

          const { error: insertError } = await supabase.from('profiles').insert(payload);
          if (insertError) {
            try {
              const adminSupabase = createAdminClient();
              await adminSupabase.from('profiles').upsert(payload, { onConflict: 'id' });
            } catch {
              // no-op
            }
          }
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        const role = resolveRoleCandidate(profile?.role, metadataRole);
        const portalError = getPortalAccessError(portal, role);

        if (portalError) {
          await supabase.auth.signOut({ scope: 'local' });
          loginUrl.searchParams.set('error', portalError);
          return NextResponse.redirect(loginUrl);
        }

        return NextResponse.redirect(new URL(getPostLoginPath(portal, nextPath), origin));
      } catch (authError) {
        console.error('Auth callback error:', authError);
        loginUrl.searchParams.set('error', 'Terjadi kesalahan saat memproses login.');
        return NextResponse.redirect(loginUrl);
      }
    }

    // No code or error, redirect to login
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error('Callback route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
