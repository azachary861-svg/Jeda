import { NextResponse } from 'next/server';
import { constructStripeEvent } from '@/lib/api/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature', code: 'SIGNATURE_REQUIRED' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: ReturnType<typeof constructStripeEvent>;
  try {
    event = constructStripeEvent(rawBody, signature);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature', code: 'INVALID_SIGNATURE' }, { status: 401 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.id;

    const supabase = createAdminClient();

    const { data: booking } = await supabase
      .from('bookings')
      .select('id,payment_status,region_id,client_id,grand_total')
      .eq('stripe_session_id', sessionId)
      .maybeSingle();

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found', code: 'NOT_FOUND' }, { status: 404 });
    }

    if (booking.payment_status !== 'paid') {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', booking.id);

      if (updateError) {
        return NextResponse.json({ error: 'Booking update failed', code: 'BOOKING_UPDATE_FAILED' }, { status: 400 });
      }

      const referenceId = `stripe:${sessionId}`;
      const { error: transactionError } = await supabase.from('transactions').upsert(
        {
          region_id: booking.region_id,
          booking_id: booking.id,
          type: 'income',
          category: 'revenue',
          amount: booking.grand_total,
          description: `Stripe payment received for session ${sessionId}`,
          reference_id: referenceId,
          transaction_date: new Date().toISOString().slice(0, 10),
        },
        { onConflict: 'reference_id' }
      );

      if (transactionError) {
        return NextResponse.json({ error: 'Transaction write failed', code: 'TRANSACTION_WRITE_FAILED' }, { status: 400 });
      }

      await supabase.from('notifications').insert({
        user_id: booking.client_id,
        title: 'Pembayaran Stripe Berhasil',
        body: 'Pembayaran internasional Anda diterima. Booking dikonfirmasi.',
        type: 'payment',
        channel: 'push',
        sent_at: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json({ received: true });
}
