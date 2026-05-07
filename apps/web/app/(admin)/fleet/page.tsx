import { createClient } from '@/lib/supabase/server';
import { createVehicleAction, updateVehicleAction } from '@/actions/admin';

export default async function FleetPage() {
  const supabase = await createClient();

  const [{ data: vehicles }, { data: regions }, { data: drivers }] = await Promise.all([
    supabase
      .from('vehicles')
      .select('id,plate_number,brand,model,status,next_service,fuel_level,region_id,driver_id,is_available')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase.from('regions').select('id,display_name,name').order('display_name', { ascending: true }).limit(50),
    supabase
      .from('profiles')
      .select('id,full_name,region_id')
      .eq('role', 'driver')
      .eq('is_active', true)
      .limit(300),
  ]);

  const driverMap = new Map((drivers ?? []).map((driver) => [driver.id, driver.full_name]));

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Fleet Management</h1>

      <section className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Tambah Kendaraan</h2>
        <form action={createVehicleAction} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <input name="plateNumber" required placeholder="AB 1234 CD" className="rounded border px-2 py-1.5 text-sm" />
          <input name="brand" required placeholder="Toyota" className="rounded border px-2 py-1.5 text-sm" />
          <input name="model" required placeholder="HiAce" className="rounded border px-2 py-1.5 text-sm" />
          <input name="year" type="number" placeholder="2024" className="rounded border px-2 py-1.5 text-sm" />
          <input name="capacity" type="number" min={1} defaultValue={8} className="rounded border px-2 py-1.5 text-sm" />
          <select name="regionId" required className="rounded border px-2 py-1.5 text-sm">
            <option value="">Pilih region</option>
            {(regions ?? []).map((region) => (
              <option key={region.id} value={region.id}>{region.display_name ?? region.name}</option>
            ))}
          </select>
          <select name="driverId" className="rounded border px-2 py-1.5 text-sm">
            <option value="">Belum assign driver</option>
            {(drivers ?? []).map((driver) => (
              <option key={driver.id} value={driver.id}>{driver.full_name}</option>
            ))}
          </select>
          <select name="status" defaultValue="active" className="rounded border px-2 py-1.5 text-sm">
            <option value="active">active</option>
            <option value="service">service</option>
            <option value="inactive">inactive</option>
          </select>
          <input name="nextService" type="date" className="rounded border px-2 py-1.5 text-sm" />
          <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">Tambah</button>
        </form>
      </section>

      <section className="mt-4 rounded-lg border bg-white p-4">
        <div className="space-y-2 text-sm">
          {(vehicles ?? []).map((vehicle) => (
            <form
              key={vehicle.id}
              action={updateVehicleAction}
              className="flex flex-wrap items-center justify-between gap-3 rounded border p-2"
            >
              <input type="hidden" name="vehicleId" value={vehicle.id} />
              <div>
                <p className="font-medium">{vehicle.plate_number} • {vehicle.brand} {vehicle.model}</p>
                <p className="text-xs text-slate-500">
                  {vehicle.region_id ?? '-'} • next service: {vehicle.next_service ?? '-'} • driver: {vehicle.driver_id ? (driverMap.get(vehicle.driver_id) ?? vehicle.driver_id) : 'unassigned'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select name="status" defaultValue={vehicle.status} className="rounded border px-2 py-1 text-xs">
                  <option value="active">active</option>
                  <option value="service">service</option>
                  <option value="inactive">inactive</option>
                </select>
                <input
                  name="fuelLevel"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={vehicle.fuel_level ?? 0}
                  className="w-20 rounded border px-2 py-1 text-xs"
                />
                <select name="isAvailable" defaultValue={vehicle.is_available ? 'true' : 'false'} className="rounded border px-2 py-1 text-xs">
                  <option value="true">available</option>
                  <option value="false">busy</option>
                </select>
                <select name="driverId" defaultValue={vehicle.driver_id ?? ''} className="rounded border px-2 py-1 text-xs">
                  <option value="">unassigned</option>
                  {(drivers ?? []).map((driver) => (
                    <option key={driver.id} value={driver.id}>{driver.full_name}</option>
                  ))}
                </select>
                <button className="rounded bg-slate-900 px-3 py-1.5 text-xs text-white">Update</button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
