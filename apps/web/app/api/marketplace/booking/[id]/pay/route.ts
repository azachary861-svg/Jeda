import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  transactionId: z.string().min(3),
  paymentMethod: z.enum(['midtrans', 'bank_transfer', 'stripe']).optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 });
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, client_id, region_id, grand_total, payment_status')
    .eq('id', id)
    .eq('client_id', userData.user.id)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  if (booking.payment_status === 'paid') {
    return NextResponse.json({ success: true, message: 'Already paid' });
  }

  const paymentMethod = parsed.data.paymentMethod ?? 'midtrans';

  if (paymentMethod === 'bank_transfer') {
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'pending_verification',
        payment_method: 'bank_transfer',
      })
      .eq('id', booking.id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update booking', code: 'BOOKING_UPDATE_FAILED' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Pending verification' });
  }

  // For online gateways, payment finalization MUST come from verified webhooks.
  return NextResponse.json(
    { success: true, message: 'Awaiting payment gateway webhook confirmation' },
    { status: 202 },
  );
}
