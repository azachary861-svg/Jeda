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
    .from('bookings')
    .select('id,booking_code,trip_date,status,trip_status,driver_id,region_id,pickup_location')
    .not('driver_id', 'is', null)
    .order('trip_date', { ascending: false })
    .limit(100);

  if (auth.profile.role === 'regional_admin' && auth.profile.region_id) {
    query = query.eq('region_id', auth.profile.region_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch trips', code: 'FETCH_FAILED' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
