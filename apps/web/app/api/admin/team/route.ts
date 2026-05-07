import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error, code: auth.code }, { status: auth.status });
  }

  const supabase = createAdminClient();

  let query = supabase
    .from('profiles')
    .select('id,full_name,email,role,region_id,is_active')
    .in('role', ['driver', 'guide', 'photographer'])
    .order('full_name', { ascending: true })
    .limit(200);

  if (auth.profile.role === 'regional_admin' && auth.profile.region_id) {
    query = query.eq('region_id', auth.profile.region_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch team', code: 'FETCH_FAILED' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
