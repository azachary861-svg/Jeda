import { createClient } from '@/lib/supabase/server';
import { DispatchPanel } from '@/components/admin/dispatch-panel';
import { DispatchMap } from '@/components/admin/dispatch-map';

export default async function DispatchPage() {
  const supabase = await createClient();

  const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: bookings }, { data: drivers }, { data: locations }] = await Promise.all([
    supabase
      .from('bookings')
      .select('id,booking_code,trip_date,status,region_id,created_at')
      .in('status', ['confirmed', 'assigned'])
      .order('trip_date', { ascending: true })
      .limit(80),
    supabase
      .from('profiles')
      .select('id,full_name,region_id,role')
      .in('role', ['driver', 'guide', 'photographer'])
      .eq('is_active', true)
      .limit(200),
    supabase
      .from('driver_locations')
      .select('driver_id,latitude,longitude,status,last_seen')
      .limit(300),
  ]);

  const locationByDriver = new Map((locations ?? []).map((item) => [item.driver_id, item]));

  const enrichedDrivers = (drivers ?? []).map((driver) => {
    const location = locationByDriver.get(driver.id);
    return {
      ...driver,
      status: location?.status ?? 'offline',
      last_seen: location?.last_seen ?? null,
    };
  });

  const urgentBookingCount = (bookings ?? []).filter((booking) => !booking.created_at || booking.created_at < staleThreshold).length;
  const standbyDriverCount = enrichedDrivers.filter((driver) => driver.status === 'standby').length;

  const driverNameById = new Map((drivers ?? []).map((driver) => [driver.id, driver.full_name]));
  const mapPoints = (locations ?? [])
    .filter((item) => item.latitude !== null && item.longitude !== null)
    .map((item) => ({
      driver_id: item.driver_id,
      full_name: driverNameById.get(item.driver_id) ?? `Driver ${item.driver_id.slice(0, 6)}`,
      latitude: Number(item.latitude),
      longitude: Number(item.longitude),
      status: item.status ?? 'offline',
      last_seen: item.last_seen ?? new Date().toISOString(),
    }));

  return (
    <main>
      <h1 className="text-2xl font-semibold">Dispatch</h1>
      <p className="mt-1 text-sm text-slate-600">Assign driver/fotografer/guide ke booking terkonfirmasi. Gunakan auto-dispatch untuk assignment cepat.</p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs uppercase text-slate-500">Urgent Queue</p>
          <p className="mt-1 text-2xl font-bold text-rose-600">{urgentBookingCount}</p>
          <p className="text-xs text-slate-500">Booking belum assigned lebih dari 24 jam</p>
        </div>
        <div className="rounded-lg border bg-white p-3">
          <p className="text-xs uppercase text-slate-500">Standby Driver</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{standbyDriverCount}</p>
          <p className="text-xs text-slate-500">Siap untuk assignment otomatis</p>
        </div>
      </div>

      <DispatchPanel bookings={bookings ?? []} drivers={enrichedDrivers} />
      <DispatchMap initialPoints={mapPoints} />
    </main>
  );
}
