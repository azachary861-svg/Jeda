import { createClient } from '@/lib/supabase/server';
import { BookingsPanel } from '@/components/admin/bookings-panel';

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id,booking_code,trip_date,status,trip_status,grand_total')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Bookings</h1>
      <p className="mt-1 text-sm text-slate-600">Monitor dan ubah status booking.</p>
      <BookingsPanel initialBookings={bookings ?? []} />
    </main>
  );
}
