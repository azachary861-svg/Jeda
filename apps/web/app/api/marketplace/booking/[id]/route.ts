import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('bookings')
    .select('id,booking_code,trip_date,pickup_location,pickup_time,status,trip_status,grand_total')
    .eq('id', id)
    .eq('client_id', userData.user.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: 'Booking not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}
