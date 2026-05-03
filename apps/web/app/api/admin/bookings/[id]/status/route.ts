import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { bookingStatusSchema } from '@/lib/validations/booking-status';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role,region_id')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (!profile || !['super_admin', 'regional_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = bookingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('id,region_id')
    .eq('id', id)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  if (profile.role === 'regional_admin' && profile.region_id !== booking.region_id) {
    return NextResponse.json({ error: 'Cross-region update denied', code: 'REGION_ACCESS_DENIED' }, { status: 403 });
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: parsed.data.status, trip_status: parsed.data.tripStatus ?? null })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Update failed', code: 'UPDATE_FAILED' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
