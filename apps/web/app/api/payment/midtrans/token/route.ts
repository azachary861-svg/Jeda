import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '';
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

/**
 * POST /api/payment/midtrans/token
 * Generate Midtrans Snap token untuk payment
 */
export async function POST(request: NextRequest) {
  try {
    if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get booking details (scoped to current authenticated client)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, client:profiles!client_id(email, full_name, phone)')
      .eq('id', bookingId)
      .eq('client_id', user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Prepare Midtrans request
    const midtransPayload = {
      transaction_details: {
        order_id: booking.booking_code,
        gross_amount: booking.grand_total,
      },
      customer_details: {
        first_name: booking.client.full_name?.split(' ')[0] || 'Customer',
        email: booking.client.email,
        phone: booking.client.phone,
      },
      item_details: [
        {
          id: booking.package_id,
          price: booking.base_price,
          quantity: booking.pax_count,
          name: 'Trip Package',
        },
        ...(booking.add_photographer
          ? [
              {
                id: 'photographer',
                price: booking.photographer_fee,
                quantity: 1,
                name: 'Photography Service',
              },
            ]
          : []),
        {
          id: 'service-fee',
          price: booking.service_fee,
          quantity: 1,
          name: 'Service Fee',
        },
      ],
      payment_type: 'credit_card',
      credit_card: {
        secure: IS_PRODUCTION,
      },
    };

    // Call Midtrans API
    const baseUrl = IS_PRODUCTION ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';
    const response = await fetch(`${baseUrl}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString(
          'base64'
        )}`,
      },
      body: JSON.stringify(midtransPayload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Midtrans error:', error);
      return NextResponse.json(
        { error: 'Failed to generate payment token' },
        { status: 500 }
      );
    }

    const midtransResponse = await response.json();

    // Store token in booking (optional, for audit trail)
    await supabase
      .from('bookings')
      .update({
        midtrans_order_id: midtransResponse.order_id,
        metadata: {
          ...booking.metadata,
          snap_token_created_at: new Date().toISOString(),
        },
      })
      .eq('id', bookingId);

    return NextResponse.json({
      success: true,
      token: midtransResponse.token,
      redirect_url: midtransResponse.redirect_url,
    });
  } catch (error) {
    console.error('Payment token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
