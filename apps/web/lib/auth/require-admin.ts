import { createClient } from '@/lib/supabase/server';
import { isAdminRole } from '@/lib/auth/portal';

export type AdminProfile = {
  id: string;
  role: string;
  region_id: string | null;
};

export type AdminAuthResult =
  | { ok: true; profile: AdminProfile }
  | { ok: false; status: 401 | 403; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' };

function toCanonicalAdminRole(role: string): 'super_admin' | 'regional_admin' {
  const normalized = role
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (normalized.includes('regional')) {
    return 'regional_admin';
  }

  return 'super_admin';
}

export async function requireAdmin(): Promise<AdminAuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, region_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !isAdminRole(profile.role)) {
    return { ok: false, status: 403, error: 'Forbidden', code: 'FORBIDDEN' };
  }

  return {
    ok: true,
    profile: {
      id: profile.id,
      role: toCanonicalAdminRole(profile.role),
      region_id: profile.region_id,
    },
  };
}
