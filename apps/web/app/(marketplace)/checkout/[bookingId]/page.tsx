import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PaymentForm } from '@/components/marketplace/PaymentForm';
import { StripePaymentButton } from '@/components/marketplace/stripe-payment-button';
import { CheckoutStatusPanel } from '@/components/marketplace/checkout-status-panel';

export default async function CheckoutPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, booking_code, grand_total, status, payment_status')
    .eq('id', bookingId)
    .maybeSingle();

  if (!booking) notFound();

  const isPaid = booking.payment_status === 'paid';
  const isAwaitingVerification = booking.payment_status === 'pending_verification';

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <div className="mt-4 rounded-lg border p-4">
        <p>Kode Booking: {booking.booking_code}</p>
        <p>Total: Rp {booking.grand_total.toLocaleString('id-ID')}</p>
        <p>Status: {booking.status}</p>
        <p>Payment: {booking.payment_status}</p>
      </div>
      <div className="mt-3">
        <CheckoutStatusPanel
          bookingId={booking.id}
          initialStatus={booking.status}
          initialPaymentStatus={booking.payment_status}
        />
      </div>
      <div className="mt-4">
        {isPaid ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            Booking ini sudah dibayar.
          </p>
        ) : isAwaitingVerification ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Bukti transfer Anda sedang diverifikasi admin. Mohon tunggu konfirmasi.
          </p>
        ) : (
          <PaymentForm bookingId={booking.id} amount={booking.grand_total} currency="IDR" />
        )}
      </div>
      {!isPaid && !isAwaitingVerification ? (
        <div className="mt-3">
          <StripePaymentButton bookingId={booking.id} disabled={isPaid} />
        </div>
      ) : null}
    </main>
  );
}
