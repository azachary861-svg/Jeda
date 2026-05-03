import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createMidtransTransaction } from '@/lib/api/midtrans';

export async function POST(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, booking_code, grand_total, client_id, payment_status, status')
    .eq('id', id)
    .eq('client_id', userData.user.id)
    .maybeSingle();

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Booking not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  if (booking.payment_status === 'paid') {
    return NextResponse.json({ error: 'Booking already paid', code: 'ALREADY_PAID' }, { status: 400 });
  }

  const orderId = `${booking.booking_code}-${Date.now()}`;

  const { error: orderUpdateError } = await supabase
    .from('bookings')
    .update({ midtrans_order_id: orderId, payment_method: 'midtrans_snap' })
    .eq('id', booking.id);

  if (orderUpdateError) {
    return NextResponse.json(
      { error: 'Failed setting payment order', code: 'PAYMENT_ORDER_INIT_FAILED' },
      { status: 400 }
    );
  }

  try {
    const payment = await createMidtransTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: booking.grand_total,
      },
    });

    return NextResponse.json({ success: true, data: payment });
  } catch {
    return NextResponse.json(
      { error: 'Failed creating Midtrans transaction', code: 'MIDTRANS_CREATE_FAILED' },
      { status: 502 }
    );
  }
}
