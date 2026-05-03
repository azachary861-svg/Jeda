import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function statusBadge(status: string) {
  if (status === 'on_trip') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'completed') return 'border-lime-200 bg-lime-50 text-lime-700';
  if (status === 'confirmed' || status === 'assigned') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (status === 'cancelled') return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
}

export default async function MyBookingsPage() {
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
    supabase = await createClient();
  } catch {
    return (
      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal terhubung ke server. Silakan coba lagi.
        </div>
      </main>
    );
  }

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/login?next=/my-bookings');

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id,booking_code,trip_date,status,grand_total,package_id')
    .eq('client_id', data.user.id)
    .order('created_at', { ascending: false });

  const activeBooking = (bookings ?? []).find((item) => ['on_trip', 'assigned', 'confirmed'].includes(item.status));

  return (
    <main className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Booking Saya</h1>
        <div className="flex gap-2 text-[11px]">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">Semua</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">Aktif</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">Selesai</span>
        </div>
      </div>

      {activeBooking ? (
        <section className="mb-3 rounded-2xl border border-emerald-400 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Trip sedang berjalan</p>
            <span className="ml-auto text-xs text-slate-500">#{activeBooking.booking_code}</span>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-900 to-emerald-700 text-2xl">🌄</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Bromo Sunrise Experience</p>
              <p className="text-xs text-slate-500">{activeBooking.trip_date} · 3 pax · Driver: Pak Budi</p>
              <div className="mt-2 flex gap-2">
                <Link href="/real-trip-maps" className="rounded-md bg-emerald-100 px-3 py-1.5 text-[11px] font-semibold text-emerald-800">
                  📍 Track Live
                </Link>
                <button className="rounded-md bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600">💬 Chat Driver</button>
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3">
            <p className="mb-2 text-[10px] text-slate-500">Status perjalanan</p>
            <div className="flex items-center gap-1 text-[9px]">
              <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-white">Jemput ✓</span>
              <span className="h-px flex-1 bg-emerald-700"></span>
              <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-white">Perjalanan ✓</span>
              <span className="h-px flex-1 bg-emerald-500"></span>
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-white">Di lokasi</span>
              <span className="h-px flex-1 bg-slate-300"></span>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-slate-500">Pulang</span>
            </div>
          </div>
        </section>
      ) : null}

      <div className="space-y-2.5">
        {(bookings ?? []).map((item) => (
          <Link key={item.id} href={`/my-bookings/${item.id}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 text-2xl">🧭</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{item.booking_code}</p>
              <p className="text-xs text-slate-500">{item.trip_date} · Rp {item.grand_total.toLocaleString('id-ID')}</p>
            </div>
            <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${statusBadge(item.status)}`}>{item.status.replaceAll('_', ' ')}</span>
          </Link>
        ))}

        {(bookings ?? []).length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">Belum ada booking. Mulai dari halaman paket wisata.</div>
        ) : null}
      </div>
    </main>
  );
}
