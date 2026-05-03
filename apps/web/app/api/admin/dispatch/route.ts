import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { assignDriverSchema } from '@/lib/validations/dispatch';

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error, code: auth.code }, { status: auth.status });
  }

  const supabase = await createClient();
  const profile = auth.profile;

  const payload = await request.json();
  const parsed = assignDriverSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, region_id, status')
    .eq('id', parsed.data.bookingId)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  if (profile.role === 'regional_admin' && profile.region_id !== booking.region_id) {
    return NextResponse.json({ error: 'Cross-region assign denied', code: 'REGION_ACCESS_DENIED' }, { status: 403 });
  }

  const { data: driver } = await supabase
    .from('profiles')
    .select('id, role, region_id')
    .eq('id', parsed.data.driverId)
    .maybeSingle();

  if (!driver || !['driver', 'photographer', 'guide'].includes(driver.role)) {
    return NextResponse.json({ error: 'Driver not valid', code: 'DRIVER_INVALID' }, { status: 400 });
  }

  if (booking.region_id !== driver.region_id) {
    return NextResponse.json({ error: 'Driver region mismatch', code: 'DRIVER_REGION_MISMATCH' }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from('bookings')
    .update({ driver_id: driver.id, status: 'assigned' })
    .eq('id', booking.id);

  if (updateError) {
    return NextResponse.json({ error: 'Assign failed', code: 'DISPATCH_ASSIGN_FAILED' }, { status: 400 });
  }

  const { error: notifError } = await supabase.from('notifications').insert({
    user_id: driver.id,
    title: 'Trip Baru Ditugaskan',
    body: 'Cek aplikasi untuk detail trip terbaru.',
    type: 'trip',
    channel: 'push',
  });

  if (notifError) {
    return NextResponse.json({ error: 'Assign success, notification failed', code: 'NOTIFICATION_FAILED' }, { status: 207 });
  }

  return NextResponse.json({ success: true });
}
