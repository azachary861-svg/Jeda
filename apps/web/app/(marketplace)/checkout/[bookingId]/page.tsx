import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PaymentButton } from '@/components/marketplace/payment-button';
import { StripePaymentButton } from '@/components/marketplace/stripe-payment-button';

export default async function CheckoutPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, booking_code, grand_total, status, payment_status')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) notFound();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <div className="mt-4 rounded-lg border p-4">
        <p>Kode Booking: {booking.booking_code}</p>
        <p>Total: Rp {booking.grand_total.toLocaleString('id-ID')}</p>
        <p>Status: {booking.status}</p>
        <p>Payment: {booking.payment_status}</p>
      </div>
      <div className="mt-4">
        <PaymentButton bookingId={booking.id} disabled={booking.payment_status === 'paid'} />
      </div>
      <div className="mt-3">
        <StripePaymentButton bookingId={booking.id} disabled={booking.payment_status === 'paid'} />
      </div>
    </main>
  );
}
