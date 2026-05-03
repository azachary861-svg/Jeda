import { createClient } from '@/lib/supabase/server';

export type AdminProfile = {
  id: string;
  role: 'super_admin' | 'regional_admin';
  region_id: string | null;
};

export type AdminAuthResult =
  | { ok: true; profile: AdminProfile }
  | { ok: false; status: 401 | 403; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' };

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

  if (!profile || !['super_admin', 'regional_admin'].includes(profile.role)) {
    return { ok: false, status: 403, error: 'Forbidden', code: 'FORBIDDEN' };
  }

  return {
    ok: true,
    profile: {
      id: profile.id,
      role: profile.role,
      region_id: profile.region_id,
    },
  };
}
