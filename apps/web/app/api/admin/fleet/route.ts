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
    .from('vehicles')
    .select('id,plate_number,brand,model,status,fuel_level,is_available,driver_id,region_id,next_service')
    .order('created_at', { ascending: false })
    .limit(200);

  if (auth.profile.role === 'regional_admin' && auth.profile.region_id) {
    query = query.eq('region_id', auth.profile.region_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch fleet', code: 'FETCH_FAILED' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
