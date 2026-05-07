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
    .select('status,payment_status,grand_total,region_id')
    .order('created_at', { ascending: false })
    .limit(500);

  if (auth.profile.role === 'regional_admin' && auth.profile.region_id) {
    query = query.eq('region_id', auth.profile.region_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch analytics', code: 'FETCH_FAILED' }, { status: 400 });
  }

  const rows = data ?? [];
  const totalBookings = rows.length;
  const paidBookings = rows.filter((row) => row.payment_status === 'paid').length;
  const confirmedTrips = rows.filter((row) => row.status === 'confirmed').length;
  const revenue = rows.reduce((sum, row) => sum + Number(row.grand_total ?? 0), 0);

  return NextResponse.json({
    success: true,
    data: {
      totalBookings,
      paidBookings,
      confirmedTrips,
      revenue,
    },
  });
}
