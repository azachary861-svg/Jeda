import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createStripeCheckoutSession } from '@/lib/api/stripe';

const allowedCurrency = ['USD', 'AUD', 'EUR'] as const;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = (await request.json()) as { currency?: string };
  const currency = body.currency?.toUpperCase() ?? 'USD';

  if (!allowedCurrency.includes(currency as (typeof allowedCurrency)[number])) {
    return NextResponse.json({ error: 'Currency not supported', code: 'CURRENCY_NOT_SUPPORTED' }, { status: 400 });
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('id,booking_code,client_id,grand_total,payment_status')
    .eq('id', id)
    .eq('client_id', userData.user.id)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  if (booking.payment_status === 'paid') {
    return NextResponse.json({ error: 'Booking already paid', code: 'ALREADY_PAID' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const orderId = `${booking.booking_code}-stripe-${Date.now()}`;

  const approxRates: Record<'USD' | 'AUD' | 'EUR', number> = {
    USD: 16500,
    AUD: 10800,
    EUR: 17900,
  };

  const unitAmount = Math.max(Math.round(booking.grand_total / approxRates[currency as 'USD' | 'AUD' | 'EUR'] * 100), 50);

  try {
    const session = await createStripeCheckoutSession({
      bookingId: booking.id,
      orderId,
      amount: unitAmount,
      currency: currency.toLowerCase() as 'usd' | 'aud' | 'eur',
      successUrl: `${appUrl}/checkout/${booking.id}`,
      cancelUrl: `${appUrl}/checkout/${booking.id}`,
    });

    const { error } = await supabase
      .from('bookings')
      .update({
        payment_method: `stripe_${currency.toLowerCase()}`,
        stripe_session_id: session.id,
      })
      .eq('id', booking.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to persist stripe session', code: 'BOOKING_UPDATE_FAILED' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: { checkoutUrl: session.url } });
  } catch {
    return NextResponse.json({ error: 'Stripe checkout create failed', code: 'STRIPE_CREATE_FAILED' }, { status: 502 });
  }
}
