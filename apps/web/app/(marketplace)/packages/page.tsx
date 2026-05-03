import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type PackagesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function packageEmoji(destination: string, name: string) {
  const source = `${destination} ${name}`.toLowerCase();

  if (source.includes('bromo') || source.includes('ijen') || source.includes('rinjani')) return '🌋';
  if (source.includes('komodo') || source.includes('sailing')) return '🤿';
  if (source.includes('heritage') || source.includes('candi')) return '🏛️';
  if (source.includes('sunrise')) return '🌄';
  if (source.includes('bali') || source.includes('uluwatu')) return '🌊';

  return '🧭';
}

function softGradient(index: number) {
  const gradients = [
    'from-emerald-950 to-emerald-700',
    'from-slate-900 to-blue-900',
    'from-indigo-950 to-indigo-700',
    'from-amber-950 to-amber-700',
    'from-teal-950 to-teal-700',
  ];

  return gradients[index % gradients.length];
}

export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  const params = await searchParams;
  const q = (readParam(params.q) ?? '').trim();
  const destination = (readParam(params.destination) ?? '').trim();
  const sort = readParam(params.sort) ?? 'newest';
  const minPrice = Number(readParam(params.minPrice) ?? '');
  const maxPrice = Number(readParam(params.maxPrice) ?? '');

  let destinations: Array<{ destination: string }> = [];
  let packages: Array<{
    id: string;
    name: string;
    slug: string;
    short_description: string | null;
    base_price: number;
    duration_days: number;
    destination: string;
  }> = [];
  let error: { message: string } | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();

      const { data: destinationData } = await supabase
        .from('packages')
        .select('destination')
        .eq('is_active', true)
        .order('destination', { ascending: true });

      destinations = destinationData ?? [];

      let packageQuery = supabase
        .from('packages')
        .select('id,name,slug,short_description,base_price,duration_days,destination')
        .eq('is_active', true);

      if (q) {
        packageQuery = packageQuery.or(`name.ilike.%${q}%,destination.ilike.%${q}%`);
      }

      if (destination) {
        packageQuery = packageQuery.eq('destination', destination);
      }

      if (Number.isFinite(minPrice)) {
        packageQuery = packageQuery.gte('base_price', minPrice);
      }

      if (Number.isFinite(maxPrice)) {
        packageQuery = packageQuery.lte('base_price', maxPrice);
      }

      if (sort === 'price_asc') {
        packageQuery = packageQuery.order('base_price', { ascending: true });
      } else if (sort === 'price_desc') {
        packageQuery = packageQuery.order('base_price', { ascending: false });
      } else {
        packageQuery = packageQuery.order('created_at', { ascending: false });
      }

      const { data: packageData, error: packageError } = await packageQuery;

      packages = packageData ?? [];
      error = packageError ? { message: packageError.message } : null;
    } catch (caughtError) {
      error = { message: caughtError instanceof Error ? caughtError.message : 'Gagal memuat paket.' };
    }
  } else {
    error = { message: 'Supabase belum terkonfigurasi di server deployment.' };
  }

  const safePackages = packages ?? [];

  const destinationOptions = Array.from(new Set((destinations ?? []).map((item) => item.destination)));

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 px-6 pb-10 pt-12">
        <div className="mx-auto max-w-6xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-3 py-1 text-[11px] text-emerald-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300"></span>
            {(safePackages.length || 0) > 0 ? `${safePackages.length} paket aktif sekarang` : 'Paket aktif siap booking'}
          </span>

          <h1 className="mt-4 max-w-xl text-4xl font-bold leading-tight text-white">
            Explore Indonesia — <span className="text-emerald-300">versi aslinya</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-emerald-100/70">
            Paket wisata dengan driver profesional, fotografer, dan dokumentasi real-time langsung dari lapangan.
          </p>

          <form className="mt-6 grid gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur md:grid-cols-6">
            <input
              name="q"
              defaultValue={q}
              placeholder="Cari destinasi atau paket wisata..."
              className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-emerald-100/50 md:col-span-2"
            />
            <select name="destination" defaultValue={destination} className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white">
              <option value="" className="text-slate-900">Semua region</option>
              {destinationOptions.map((item) => (
                <option key={item} value={item} className="text-slate-900">
                  {item}
                </option>
              ))}
            </select>
            <select name="sort" defaultValue={sort} className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white">
              <option value="newest" className="text-slate-900">Terbaru</option>
              <option value="price_asc" className="text-slate-900">Harga termurah</option>
              <option value="price_desc" className="text-slate-900">Harga termahal</option>
            </select>
            <input
              name="minPrice"
              defaultValue={Number.isFinite(minPrice) ? String(minPrice) : ''}
              placeholder="Harga min"
              className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-emerald-100/50"
            />
            <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400">
              Cari Paket
            </button>
            <input
              name="maxPrice"
              defaultValue={Number.isFinite(maxPrice) ? String(maxPrice) : ''}
              placeholder="Harga max"
              className="rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-emerald-100/50 md:col-span-2"
            />
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Paket terpopuler</h2>
          <p className="text-xs text-slate-500">{safePackages.length} paket ditemukan</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Semua</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">1 Hari</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">2 Hari</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">Sunrise</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">Petualangan</span>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error.message || 'Gagal memuat paket. Silakan refresh halaman.'}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {safePackages.map((pkg, index) => (
            <Link key={pkg.id} href={`/packages/${pkg.slug}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${softGradient(index)}`}>
                <span className="text-5xl">{packageEmoji(pkg.destination, pkg.name)}</span>
                <span className="absolute left-3 top-3 rounded-md bg-black/40 px-2 py-1 text-[10px] text-white">{pkg.destination}</span>
                <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] text-slate-700">♡</span>
              </div>

              <div className="p-4">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">{pkg.destination}</p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900">{pkg.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{pkg.short_description}</p>
                <p className="mt-2 text-xs text-slate-500">⏱ {pkg.duration_days} hari · ★ 4.9</p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold text-emerald-700">Rp {pkg.base_price.toLocaleString('id-ID')}</p>
                  <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Pesan →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!error && safePackages.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            Tidak ada paket yang sesuai filter. Coba ubah kata kunci atau rentang harga.
          </div>
        ) : null}
      </section>

      <section className="border-y border-slate-200 bg-white px-6 py-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-semibold text-emerald-700">🔴 LIVE Fitur eksklusif</span>
            <h3 className="mt-3 text-xl font-bold text-slate-900">Real Trip Maps</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Lihat posisi driver on duty secara real-time. Klik pin untuk melihat dokumentasi langsung dari lapangan.
            </p>
            <Link href="/real-trip-maps" className="mt-4 inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white">
              Buka Real Trip Maps →
            </Link>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
            <p className="text-xs text-emerald-300">47 driver aktif</p>
            <p className="mt-1 text-sm text-slate-300">Jogja, Bali, Lombok, dan Labuan Bajo sedang live.</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-white/10 p-2 text-center text-xs">🚗 Bromo</div>
              <div className="rounded-lg bg-white/10 p-2 text-center text-xs">🚗 Bali</div>
              <div className="rounded-lg bg-white/10 p-2 text-center text-xs">🚗 Lombok</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Ulasan perjalanan</h3>
          <p className="text-xs text-slate-500">★ 4.9 dari 1.840 ulasan</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm text-amber-600">★★★★★</p>
            <p className="mt-2 text-xs leading-6 text-slate-600">“Real Trip Maps-nya keren! Bisa pantau driver dari rumah. Sampai lokasi driver sudah siap.”</p>
            <p className="mt-2 text-[11px] text-slate-500">Sari D. · Bromo Trip</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm text-amber-600">★★★★★</p>
            <p className="mt-2 text-xs leading-6 text-slate-600">“Foto-fotonya luar biasa! Fotografer mereka profesional banget. Sudah 3x booking sini.”</p>
            <p className="mt-2 text-[11px] text-slate-500">Reza A. · Ijen Trip</p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm text-amber-600">★★★★★</p>
            <p className="mt-2 text-xs leading-6 text-slate-600">“Komodo trip terbaik! Kapalnya nyaman, guide expert, dan spot snorkeling pilihan.”</p>
            <p className="mt-2 text-[11px] text-slate-500">James T. · Komodo Trip</p>
          </article>
        </div>
      </section>
    </main>
  );
}
