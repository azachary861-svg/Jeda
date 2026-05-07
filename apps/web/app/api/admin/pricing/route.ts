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
    .from('pricing_rules')
    .select('id,name,rule_type,multiplier,priority,is_active,region_id,package_id,start_date,end_date')
    .order('priority', { ascending: false })
    .limit(200);

  if (auth.profile.role === 'regional_admin' && auth.profile.region_id) {
    query = query.or(`region_id.is.null,region_id.eq.${auth.profile.region_id}`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch pricing rules', code: 'FETCH_FAILED' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
