import Link from 'next/link';
import type { Route } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function TripsPage() {
  const supabase = await createClient();

  const { data: trips } = await supabase
    .from('bookings')
    .select('id,booking_code,trip_date,status,trip_status,region_id,grand_total')
    .order('trip_date', { ascending: false })
    .limit(80);

  return (
    <main>
      <h1 className="text-2xl font-semibold">Trip Management</h1>
      <p className="mt-1 text-sm text-slate-600">Filter by status/region/date akan diperluas pada iterasi berikutnya.</p>
      <section className="mt-4 rounded-lg border bg-white p-4">
        <div className="space-y-2 text-sm">
          {(trips ?? []).map((trip) => (
            <div key={trip.id} className="flex items-center justify-between rounded border p-2">
              <div>
                <p className="font-medium">{trip.booking_code}</p>
                <p className="text-xs text-slate-500">{trip.trip_date} • {trip.status}</p>
              </div>
              <Link href={`/trips/${trip.id}` as Route} className="rounded border px-2 py-1 text-xs">
                Open
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
