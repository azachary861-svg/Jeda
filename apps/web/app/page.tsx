import Link from 'next/link';
import type { Route } from 'next';
import { createClient } from '@/lib/supabase/server';
import { isAdminRole, isDriverRole } from '@/lib/auth/portal';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    role = profile?.role ?? null;
  }

  const isAdmin = isAdminRole(role);
  const isDriver = isDriverRole(role);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Jeda Wisata</h1>
        <p className="mt-3 text-lg text-slate-600">
          Sekarang aplikasi dibagi menjadi dua portal yang jelas: marketplace untuk client dan dashboard untuk admin internal.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Marketplace Client
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">Buka website marketplace</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Portal ini dipakai client untuk melihat paket wisata, melakukan booking, membayar, dan memantau trip yang sedang berjalan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-primary px-4 py-2 text-white" href={(isAdmin ? '/packages' : user ? '/packages' : '/login') as Route}>
              {user && !isAdmin ? 'Lanjut sebagai client' : 'Masuk sebagai client'}
            </Link>
            <Link className="rounded-lg border px-4 py-2" href="/packages">
              Lihat paket wisata
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-sm">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
            Admin Dashboard
          </span>
          <h2 className="mt-4 text-2xl font-semibold">Buka dashboard internal</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Portal ini khusus super admin dan regional admin untuk operasional lapangan, dispatch, CRM, finance, dan analytics.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-white px-4 py-2 font-medium text-slate-950" href={(isAdmin ? '/dashboard' : '/dashboard/login') as Route}>
              {isAdmin ? 'Lanjut ke dashboard' : 'Masuk sebagai admin'}
            </Link>
            <Link className="rounded-lg border border-white/20 px-4 py-2 text-white" href="/dashboard/login">
              Portal admin
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-1">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
            Driver App
          </span>
          <h2 className="mt-4 text-2xl font-semibold text-slate-900">Buka aplikasi driver</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Portal ini untuk driver lapangan: jadwal trip, upload dokumentasi live, chat klien, dan status GPS real-time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded-lg bg-slate-900 px-4 py-2 text-white" href={(isDriver ? '/driver' : '/driver/login') as Route}>
              {isDriver ? 'Lanjut ke driver app' : 'Masuk sebagai driver'}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
