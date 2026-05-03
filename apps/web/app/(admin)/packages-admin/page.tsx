import { createClient } from '@/lib/supabase/server';

export default async function PackagesAdminPage() {
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from('packages')
    .select('id,name,slug,destination,base_price,is_active,is_featured')
    .order('created_at', { ascending: false })
    .limit(120);

  return (
    <main>
      <h1 className="text-2xl font-semibold">Packages Management</h1>
      <section className="mt-4 rounded-lg border bg-white p-4">
        <div className="space-y-2 text-sm">
          {(packages ?? []).map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between rounded border p-2">
              <div>
                <p className="font-medium">{pkg.name}</p>
                <p className="text-xs text-slate-500">{pkg.destination} • {pkg.slug}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">Rp {pkg.base_price.toLocaleString('id-ID')}</p>
                <p className="text-xs text-slate-500">{pkg.is_active ? 'active' : 'inactive'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
