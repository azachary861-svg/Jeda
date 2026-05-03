import { createClient } from '@/lib/supabase/server';

export default async function FleetPage() {
  const supabase = await createClient();

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('id,plate_number,brand,model,status,next_service,fuel_level,region_id')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <main>
      <h1 className="text-2xl font-semibold">Fleet Management</h1>
      <section className="mt-4 rounded-lg border bg-white p-4">
        <div className="space-y-2 text-sm">
          {(vehicles ?? []).map((vehicle) => (
            <div key={vehicle.id} className="flex items-center justify-between rounded border p-2">
              <div>
                <p className="font-medium">{vehicle.plate_number} • {vehicle.brand} {vehicle.model}</p>
                <p className="text-xs text-slate-500">{vehicle.region_id ?? '-'} • next service: {vehicle.next_service ?? '-'}</p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{vehicle.status}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
