import { notFound } from 'next/navigation';
import { BookingForm } from '@/components/marketplace/booking-form';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: pkg } = await supabase
    .from('packages')
    .select('id,name,description,base_price,duration_days,min_pax,max_pax')
    .eq('slug', slug)
    .maybeSingle();

  if (!pkg) notFound();

  return (
    <main className="mx-auto grid max-w-6xl gap-4 px-6 py-5 lg:grid-cols-[1fr_320px]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative flex h-52 items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-emerald-700 text-6xl">
          🌄
          <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-[10px] text-white">Jogja Hub · Malang</span>
        </div>
        <div className="p-4">
          <h1 className="text-xl font-bold text-slate-900">{pkg.name}</h1>
          <p className="mt-1 text-sm text-slate-500">★ 4.9 (124 ulasan) · Sudah 420+ orang ikut trip ini</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">{pkg.description}</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-100 p-2.5">
              <p className="text-[10px] text-slate-500">Durasi</p>
              <p className="text-sm font-semibold text-slate-900">{pkg.duration_days} hari</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2.5">
              <p className="text-[10px] text-slate-500">Min peserta</p>
              <p className="text-sm font-semibold text-slate-900">{pkg.min_pax} orang</p>
            </div>
            <div className="rounded-lg bg-slate-100 p-2.5">
              <p className="text-[10px] text-slate-500">Max peserta</p>
              <p className="text-sm font-semibold text-slate-900">{pkg.max_pax ?? 'Fleksibel'}</p>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="mb-2 text-sm font-semibold text-slate-900">Yang sudah termasuk</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li>✓ Transportasi PP dengan mobil AC</li>
              <li>✓ Tiket masuk area wisata</li>
              <li>✓ Dokumentasi selama perjalanan</li>
              <li>✓ Air mineral & snack</li>
            </ul>
          </div>
        </div>
      </section>

      <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-20">
        <p className="text-2xl font-bold text-emerald-700">Rp {pkg.base_price.toLocaleString('id-ID')}</p>
        <p className="text-xs text-slate-500">per orang · sudah termasuk biaya dasar</p>
        <div className="mt-4">
          <BookingForm packageId={pkg.id} minPax={pkg.min_pax} maxPax={pkg.max_pax} />
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-400">🔒 Pembayaran aman · Dukungan real-time</p>
      </aside>
    </main>
  );
}
