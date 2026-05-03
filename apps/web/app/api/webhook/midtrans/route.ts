import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

type MidtransWebhook = {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
};

function verifyMidtransSignature(payload: MidtransWebhook, serverKey: string): boolean {
  const raw = `${payload.order_id}${payload.status_code}${payload.gross_amount}${serverKey}`;
  const expected = crypto.createHash('sha512').update(raw).digest('hex');
  return expected === payload.signature_key;
}

export async function POST(request: Request) {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    return NextResponse.json({ error: 'Server misconfigured', code: 'CONFIG_ERROR' }, { status: 500 });
  }

  const body = (await request.json()) as MidtransWebhook;

  if (!verifyMidtransSignature(body, serverKey)) {
    return NextResponse.json({ error: 'Invalid signature', code: 'INVALID_SIGNATURE' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id,status,payment_status,region_id,client_id,grand_total')
    .eq('midtrans_order_id', body.order_id)
    .maybeSingle();

  if (!existingBooking) {
    return NextResponse.json({ error: 'Booking not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  if (existingBooking.payment_status === 'paid') {
    return NextResponse.json({ success: true, message: 'Already processed' });
  }

  const isPaid = body.transaction_status === 'settlement' || body.transaction_status === 'capture';

  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      payment_status: isPaid ? 'paid' : 'pending',
      status: isPaid ? 'confirmed' : 'pending_payment',
    })
    .eq('id', existingBooking.id);

  if (updateError) {
    return NextResponse.json({ error: 'Update booking failed', code: 'BOOKING_UPDATE_FAILED' }, { status: 400 });
  }

  if (isPaid) {
    const paymentRefId = `midtrans:${body.order_id}`;
    const { error: transactionError } = await supabase.from('transactions').upsert(
      {
        region_id: existingBooking.region_id,
        booking_id: existingBooking.id,
        type: 'income',
        category: 'revenue',
        amount: existingBooking.grand_total,
        description: `Payment received for order ${body.order_id}`,
        reference_id: paymentRefId,
        transaction_date: new Date().toISOString().slice(0, 10),
      },
      { onConflict: 'reference_id' }
    );

    if (transactionError) {
      return NextResponse.json({ error: 'Transaction write failed', code: 'TRANSACTION_WRITE_FAILED' }, { status: 400 });
    }

    await supabase.from('notifications').insert({
      user_id: existingBooking.client_id,
      title: 'Pembayaran Berhasil',
      body: 'Pembayaran Anda sudah diterima. Booking dikonfirmasi.',
      type: 'payment',
      channel: 'push',
      sent_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({ success: true });
}
