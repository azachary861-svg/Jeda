import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  bookingId: z.string().uuid(),
  bankName: z.string().min(2),
  transferCode: z.string().min(3),
});

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 });
  }

  const { bookingId, bankName, transferCode } = parsed.data;

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, client_id, payment_status')
    .eq('id', bookingId)
    .eq('client_id', userData.user.id)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  if (booking.payment_status === 'paid') {
    return NextResponse.json({ error: 'Booking already paid', code: 'ALREADY_PAID' }, { status: 400 });
  }

  const transactionId = `bt-${Date.now()}`;

  const { error: bookingUpdateError } = await supabase
    .from('bookings')
    .update({
      payment_status: 'pending_verification',
      payment_method: 'bank_transfer',
    })
    .eq('id', booking.id);

  if (bookingUpdateError) {
    return NextResponse.json({ error: 'Failed to update booking', code: 'BOOKING_UPDATE_FAILED' }, { status: 400 });
  }

  await supabase.from('notifications').insert({
    user_id: booking.client_id,
    title: 'Transfer Diterima',
    body: `Kode transfer ${transferCode} (${bankName}) sedang diverifikasi admin.`,
    type: 'payment',
    channel: 'push',
    sent_at: new Date().toISOString(),
  });

  return NextResponse.json({ success: true, transactionId });
}
