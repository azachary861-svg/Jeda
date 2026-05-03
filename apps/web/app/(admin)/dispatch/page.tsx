import { createClient } from '@/lib/supabase/server';
import { DispatchPanel } from '@/components/admin/dispatch-panel';

export default async function DispatchPage() {
  const supabase = await createClient();

  const [{ data: bookings }, { data: drivers }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id,booking_code,trip_date,status,region_id')
      .in('status', ['confirmed', 'assigned'])
      .order('trip_date', { ascending: true })
      .limit(30),
    supabase
      .from('profiles')
      .select('id,full_name,region_id,role')
      .in('role', ['driver', 'guide', 'photographer'])
      .eq('is_active', true)
      .limit(100),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Dispatch</h1>
      <p className="mt-1 text-sm text-slate-600">Assign driver/fotografer/guide ke booking terkonfirmasi.</p>
      <DispatchPanel bookings={bookings ?? []} drivers={drivers ?? []} />
    </main>
  );
}
