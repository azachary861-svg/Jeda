import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reviewCreateSchema } from '@/lib/validations/review';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = reviewCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('id,client_id,status,driver_id,package_id')
    .eq('id', parsed.data.bookingId)
    .eq('client_id', userData.user.id)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  if (booking.status !== 'completed') {
    return NextResponse.json({ error: 'Trip not completed', code: 'TRIP_NOT_COMPLETED' }, { status: 400 });
  }

  const { error } = await supabase.from('reviews').insert({
    booking_id: booking.id,
    client_id: userData.user.id,
    package_id: booking.package_id,
    driver_id: booking.driver_id,
    rating: parsed.data.rating,
    driver_rating: parsed.data.driverRating ?? null,
    photo_rating: parsed.data.photoRating ?? null,
    comment: parsed.data.comment ?? null,
  });

  if (error) {
    return NextResponse.json({ error: 'Review create failed', code: 'REVIEW_CREATE_FAILED' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
