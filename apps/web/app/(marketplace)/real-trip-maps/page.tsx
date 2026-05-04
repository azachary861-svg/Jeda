import { isSupabaseConfigured } from '@/lib/supabase/server';
import { RealTripMapLive } from '@/components/marketplace/real-trip-map-live';
import { createClient as createPublicClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function RealTripMapsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Layanan belum terkonfigurasi. Hubungi administrator.
        </div>
      </main>
    );
  }

  let supabase;
  try {
    supabase = createPublicClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );
  } catch {
    return (
      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal terhubung ke server. Silakan coba lagi.
        </div>
      </main>
    );
  }

  const { data: initialLocations, error: locationError } = await supabase
    .from('driver_locations')
    .select('id,driver_id,booking_id,latitude,longitude,status,last_seen')
    .eq('is_sharing', true)
    .not('booking_id', 'is', null)
    .order('last_seen', { ascending: false })
    .limit(100);

  const activeBookingIds = Array.from(
    new Set((initialLocations ?? []).map((item) => item.booking_id).filter((bookingId): bookingId is string => Boolean(bookingId)))
  );

  const bookingCodeMap = {} as Record<string, string>;

  const hasError = Boolean(locationError);

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
          Belum ada booking aktif dengan lokasi driver yang dapat dipantau.
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
