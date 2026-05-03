import Stripe from 'stripe';

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-08-27.basil',
  });
}

export async function createStripeCheckoutSession(params: {
  bookingId: string;
  orderId: string;
  amount: number;
  currency: 'usd' | 'aud' | 'eur';
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: params.currency,
          product_data: {
            name: `Jeda Wisata Booking ${params.orderId}`,
          },
          unit_amount: params.amount,
        },
      },
    ],
    metadata: {
      bookingId: params.bookingId,
      orderId: params.orderId,
    },
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });

  return session;
}

export function constructStripeEvent(body: string, signature: string) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
