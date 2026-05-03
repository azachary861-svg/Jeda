import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ count: bookingCount }, { count: packageCount }] = await Promise.all([
    supabase.from('bookings').select('*', { count: 'exact', head: true }),
    supabase.from('packages').select('*', { count: 'exact', head: true }),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-500">Total Bookings</p>
          <p className="text-2xl font-bold">{bookingCount ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-slate-500">Total Packages</p>
          <p className="text-2xl font-bold">{packageCount ?? 0}</p>
        </div>
      </div>
    </main>
  );
}
