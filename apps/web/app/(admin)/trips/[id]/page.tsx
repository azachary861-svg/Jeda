import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type TripDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: booking }, { data: location }, { data: notifications }, { data: transactions }, { data: review }] = await Promise.all([
    supabase
      .from('bookings')
      .select(
        `
        id,
        booking_code,
        status,
        trip_status,
        trip_date,
        pickup_time,
        pickup_location,
        pax_count,
        notes,
        grand_total,
        created_at,
        updated_at,
        package:packages(name,destination),
        client:profiles!bookings_client_id_fkey(full_name,email),
        driver:profiles!bookings_driver_id_fkey(full_name,email)
      `
      )
      .eq('id', id)
      .maybeSingle(),
    supabase.from('driver_locations').select('latitude,longitude,status,last_seen').eq('booking_id', id).maybeSingle(),
    supabase
      .from('notifications')
      .select('id,title,body,created_at,type')
      .contains('data', { booking_id: id })
      .order('created_at', { ascending: false })
      .limit(15),
    supabase
      .from('transactions')
      .select('id,amount,category,type,transaction_date,description')
      .eq('booking_id', id)
      .order('transaction_date', { ascending: false }),
    supabase.from('reviews').select('rating,comment,created_at').eq('booking_id', id).maybeSingle(),
  ]);

  if (!booking) {
    notFound();
  }

  const packageInfo = Array.isArray(booking.package) ? booking.package[0] : booking.package;
  const clientInfo = Array.isArray(booking.client) ? booking.client[0] : booking.client;
  const driverInfo = Array.isArray(booking.driver) ? booking.driver[0] : booking.driver;

  const timeline = [
    { label: 'Booking dibuat', at: booking.created_at, value: booking.status },
    { label: 'Terakhir diperbarui', at: booking.updated_at, value: booking.trip_status ?? 'n/a' },
    ...(notifications ?? []).map((item) => ({ label: item.title, at: item.created_at, value: item.type })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <main>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Trip Detail</h1>
          <p className="text-sm text-slate-600">{booking.booking_code}</p>
        </div>
        <Link href="/trips" className="rounded border px-3 py-2 text-sm">
          Kembali ke Trips
        </Link>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <section className="rounded-lg border bg-white p-4 xl:col-span-2">
          <h2 className="text-lg font-semibold">Informasi Booking</h2>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            <p><span className="text-slate-500">Package:</span> {packageInfo?.name ?? '-'}</p>
            <p><span className="text-slate-500">Destination:</span> {packageInfo?.destination ?? '-'}</p>
            <p><span className="text-slate-500">Tanggal:</span> {booking.trip_date}</p>
            <p><span className="text-slate-500">Pickup:</span> {booking.pickup_time} • {booking.pickup_location}</p>
            <p><span className="text-slate-500">Pax:</span> {booking.pax_count}</p>
            <p><span className="text-slate-500">Total:</span> Rp {booking.grand_total.toLocaleString('id-ID')}</p>
            <p><span className="text-slate-500">Status:</span> {booking.status}</p>
            <p><span className="text-slate-500">Trip status:</span> {booking.trip_status ?? '-'}</p>
            <p><span className="text-slate-500">Client:</span> {clientInfo?.full_name ?? '-'}</p>
            <p><span className="text-slate-500">Driver:</span> {driverInfo?.full_name ?? '-'}</p>
          </div>
          {booking.notes ? <p className="mt-3 rounded bg-slate-50 p-2 text-sm text-slate-700">Notes: {booking.notes}</p> : null}
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold">GPS Live</h2>
          {location ? (
            <div className="mt-3 space-y-1 text-sm">
              <p>Lat: {Number(location.latitude).toFixed(6)}</p>
              <p>Lng: {Number(location.longitude).toFixed(6)}</p>
              <p>Status: {location.status}</p>
              <p className="text-slate-500">Last seen: {new Date(location.last_seen).toLocaleString('id-ID')}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Belum ada data lokasi driver untuk booking ini.</p>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <div className="mt-3 space-y-2 text-sm">
          {timeline.map((item, index) => (
            <div key={`${item.label}-${index}`} className="rounded border p-2">
              <p className="font-medium">{item.label}</p>
              <p className="text-slate-500">{new Date(item.at).toLocaleString('id-ID')} • {item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <section className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold">Transaksi Terkait</h2>
          <div className="mt-3 space-y-2 text-sm">
            {(transactions ?? []).length === 0 ? <p className="text-slate-500">Belum ada transaksi.</p> : null}
            {(transactions ?? []).map((tx) => (
              <div key={tx.id} className="rounded border p-2">
                <p className="font-medium">{tx.category} • {tx.type}</p>
                <p>Rp {tx.amount.toLocaleString('id-ID')}</p>
                <p className="text-slate-500">{tx.transaction_date} • {tx.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-white p-4">
          <h2 className="text-lg font-semibold">Review Client</h2>
          {review ? (
            <div className="mt-3 rounded border p-2 text-sm">
              <p className="font-medium">Rating: {review.rating}/5</p>
              <p className="mt-1 text-slate-700">{review.comment ?? 'Tanpa komentar.'}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(review.created_at).toLocaleString('id-ID')}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">Belum ada review untuk trip ini.</p>
          )}
        </section>
      </div>
    </main>
  );
}
