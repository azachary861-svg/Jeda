import { createClient } from '@/lib/supabase/server';

export type DriverProfile = {
  id: string;
  role: 'driver';
  full_name: string | null;
  region_id: string | null;
};

export type DriverAuthResult =
  | { ok: true; profile: DriverProfile }
  | { ok: false; status: 401 | 403; error: string; code: 'UNAUTHORIZED' | 'FORBIDDEN' };

export async function requireDriver(): Promise<DriverAuthResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, error: 'Unauthorized', code: 'UNAUTHORIZED' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name, region_id')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'driver') {
    return { ok: false, status: 403, error: 'Forbidden', code: 'FORBIDDEN' };
  }

  return {
    ok: true,
    profile: {
      id: profile.id,
      role: 'driver',
      full_name: profile.full_name,
      region_id: profile.region_id,
    },
  };
}
