import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { bookingStatusSchema } from '@/lib/validations/booking-status';

type BookingStatus = 'pending_payment' | 'confirmed' | 'assigned' | 'on_trip' | 'completed' | 'cancelled' | 'refunded';

const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['assigned', 'cancelled'],
  assigned: ['on_trip', 'cancelled'],
  on_trip: ['completed'],
  completed: ['refunded'],
  cancelled: [],
  refunded: [],
};

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error, code: auth.code }, { status: auth.status });
  }

  const supabase = await createClient();
  const profile = auth.profile;

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
    .select('id,region_id,status')
    .eq('id', id)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  if (profile.role === 'regional_admin' && profile.region_id !== booking.region_id) {
    return NextResponse.json({ error: 'Cross-region update denied', code: 'REGION_ACCESS_DENIED' }, { status: 403 });
  }

  const currentStatus = booking.status as BookingStatus;
  const nextStatus = parsed.data.status as BookingStatus;
  const canTransition = currentStatus === nextStatus || allowedTransitions[currentStatus].includes(nextStatus);

  if (!canTransition) {
    return NextResponse.json(
      {
        error: `Transisi status tidak valid: ${currentStatus} -> ${nextStatus}`,
        code: 'INVALID_STATUS_TRANSITION',
      },
      { status: 400 }
    );
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
