import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ReviewForm } from '@/components/marketplace/reviews/review-form';

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from('bookings')
    .select('id,booking_code,trip_date,pickup_location,pickup_time,status,trip_status,grand_total,package_id')
    .eq('id', id)
    .maybeSingle();

  if (!booking) notFound();

  const { data: review } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', booking.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-semibold">{booking.booking_code}</h1>
      <div className="mt-4 rounded-lg border p-4 text-sm">
        <p>Trip: {booking.trip_date} {booking.pickup_time}</p>
        <p>Pickup: {booking.pickup_location}</p>
        <p>Status Booking: {booking.status}</p>
        <p>Status Trip: {booking.trip_status ?? '-'}</p>
        <p>Total: Rp {booking.grand_total.toLocaleString('id-ID')}</p>
      </div>

      {booking.status === 'completed' && !review ? (
        <ReviewForm bookingId={booking.id} packageId={booking.package_id} />
      ) : null}
    </main>
  );
}
