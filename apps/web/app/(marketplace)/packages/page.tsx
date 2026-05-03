import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function PackagesPage() {
  const supabase = await createClient();
  const { data: packages } = await supabase
    .from('packages')
    .select('id,name,slug,short_description,base_price,duration_days,destination')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Paket Wisata</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(packages ?? []).map((pkg) => (
          <Link key={pkg.id} href={`/packages/${pkg.slug}`} className="rounded-lg border p-4 hover:border-primary">
            <p className="font-semibold">{pkg.name}</p>
            <p className="mt-1 text-sm text-slate-600">{pkg.short_description}</p>
            <p className="mt-2 text-sm text-slate-500">{pkg.destination} • {pkg.duration_days} hari</p>
            <p className="mt-3 font-semibold text-primary">Rp {pkg.base_price.toLocaleString('id-ID')}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
