import { createClient } from '@/lib/supabase/server';
import { RealTripMapLive } from '@/components/marketplace/real-trip-map-live';
import { redirect } from 'next/navigation';

export default async function RealTripMapsPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect('/login?next=/real-trip-maps');
  }

  const { data: activeBookings, error: bookingError } = await supabase
    .from('bookings')
    .select('id, booking_code, status, trip_status, trip_date')
    .eq('client_id', userData.user.id)
    .in('status', ['confirmed', 'assigned', 'on_trip'])
    .order('trip_date', { ascending: true })
    .limit(10);

  const activeBookingIds = (activeBookings ?? []).map((item) => item.id);

  const { data: initialLocations, error: locationError } = activeBookingIds.length
    ? await supabase
        .from('driver_locations')
        .select('id,driver_id,booking_id,latitude,longitude,status,last_seen')
        .in('booking_id', activeBookingIds)
        .eq('is_sharing', true)
        .order('last_seen', { ascending: false })
        .limit(100)
    : { data: [], error: null };

  const bookingCodeMap = Object.fromEntries((activeBookings ?? []).map((item) => [item.id, item.booking_code])) as Record<
    string,
    string
  >;

  const hasError = Boolean(bookingError || locationError);

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
          LIVE — {activeBookingIds.length} booking aktif
        </span>
        <p className="text-xs text-slate-500">Klik pin driver untuk lihat dokumentasi real-time dari lapangan</p>
      </div>

      {hasError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal memuat data lokasi trip. Silakan refresh halaman.
        </div>
      ) : null}

      {!hasError && activeBookingIds.length === 0 ? (
        <div className="rounded-lg border bg-white p-5 text-sm text-slate-600">
          Anda belum memiliki booking aktif dengan driver yang dapat dipantau.
        </div>
      ) : (
        <div className="space-y-3">
          <RealTripMapLive
            initialLocations={initialLocations ?? []}
            activeBookingIds={activeBookingIds}
            bookingCodeMap={bookingCodeMap}
          />
          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-900">Pak Budi · Bromo</p>
              <p className="mt-1 text-[11px] text-slate-500">Update 3 mnt lalu · GPS aktif</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-900">Komang · Ubud Bali</p>
              <p className="mt-1 text-[11px] text-slate-500">Update 12 mnt lalu · GPS aktif</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-semibold text-slate-900">Raden · Komodo</p>
              <p className="mt-1 text-[11px] text-slate-500">Update 28 mnt lalu · GPS aktif</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
