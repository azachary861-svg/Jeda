import { notFound } from 'next/navigation';
import { BookingForm } from '@/components/marketplace/booking-form';
import { createClient } from '@/lib/supabase/server';

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
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-2xl font-bold">{pkg.name}</h1>
      <p className="mt-2 text-slate-600">{pkg.description}</p>
      <p className="mt-4 text-lg font-semibold text-primary">Rp {pkg.base_price.toLocaleString('id-ID')}</p>
      <div className="mt-6">
        <BookingForm packageId={pkg.id} minPax={pkg.min_pax} maxPax={pkg.max_pax} />
      </div>
    </main>
  );
}
