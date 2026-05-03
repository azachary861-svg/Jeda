import { NextResponse } from 'next/server';
import { bookingCreateSchema } from '@/lib/validations/booking';
import { createClient } from '@/lib/supabase/server';
import { createMidtransTransaction } from '@/lib/api/midtrans';

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = bookingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data: priceData, error: priceError } = await supabase.rpc('calculate_booking_price', {
    p_package_id: parsed.data.packageId,
    p_trip_date: parsed.data.tripDate,
    p_pax_count: parsed.data.paxCount,
    p_add_photographer: parsed.data.addPhotographer,
  });

  if (priceError || !priceData?.[0]) {
    return NextResponse.json({ error: 'Pricing failed', code: 'PRICING_ERROR' }, { status: 400 });
  }

  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('region_id')
    .eq('id', parsed.data.packageId)
    .single();

  if (pkgError || !pkg) {
    return NextResponse.json({ error: 'Package not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  const pricing = priceData[0];

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      client_id: userData.user.id,
      package_id: parsed.data.packageId,
      region_id: pkg.region_id,
      trip_date: parsed.data.tripDate,
      pickup_time: parsed.data.pickupTime,
      pickup_location: parsed.data.pickupLocation,
      pax_count: parsed.data.paxCount,
      add_photographer: parsed.data.addPhotographer,
      base_price: pricing.base_price,
      price_multiplier: pricing.multiplier,
      photographer_fee: pricing.photographer_fee,
      service_fee: pricing.service_fee,
      total_price: Math.round(Number(pricing.base_price) * Number(pricing.multiplier) * parsed.data.paxCount),
      grand_total: pricing.grand_total,
      status: 'pending_payment',
      payment_status: 'pending',
      booking_source: 'web',
    })
    .select('id, booking_code, grand_total')
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Booking create failed', code: 'BOOKING_CREATE_FAILED' }, { status: 400 });
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

  let payment: { token: string; redirect_url: string } | null = null;
  try {
    payment = await createMidtransTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: booking.grand_total,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed creating Midtrans transaction', code: 'MIDTRANS_CREATE_FAILED' },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, data: { ...booking, payment } });
}
