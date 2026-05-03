import { createClient } from '@/lib/supabase/server';

export default async function PayrollPage() {
  const supabase = await createClient();

  const { data: drivers } = await supabase
    .from('profiles')
    .select('id,full_name,region_id')
    .eq('role', 'driver')
    .eq('is_active', true)
    .limit(200);

  return (
    <main>
      <h1 className="text-2xl font-semibold">Payroll</h1>
      <p className="mt-1 text-sm text-slate-600">Status payroll per driver (preview awal).</p>
      <section className="mt-4 rounded-lg border bg-white p-4">
        <p className="text-sm text-slate-500">Total driver aktif: {drivers?.length ?? 0}</p>
        <div className="mt-3 space-y-2 text-sm">
          {(drivers ?? []).slice(0, 40).map((driver) => (
            <div key={driver.id} className="flex items-center justify-between rounded border p-2">
              <p>{driver.full_name}</p>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700">pending</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
