import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error, code: auth.code }, { status: auth.status });
  }

  const supabase = await createClient();
  const profile = auth.profile;

  let bookingQuery = supabase
    .from('bookings')
    .select('id,region_id')
    .eq('status', 'confirmed')
    .is('driver_id', null)
    .order('trip_date', { ascending: true })
    .limit(200);

  let driverQuery = supabase
    .from('profiles')
    .select('id,region_id')
    .eq('role', 'driver')
    .eq('is_active', true)
    .limit(300);

  if (profile.role === 'regional_admin' && profile.region_id) {
    bookingQuery = bookingQuery.eq('region_id', profile.region_id);
    driverQuery = driverQuery.eq('region_id', profile.region_id);
  }

  const [{ data: bookings }, { data: drivers }, { data: locations }] = await Promise.all([
    bookingQuery,
    driverQuery,
    supabase.from('driver_locations').select('driver_id,status').in('status', ['standby', 'offline']),
  ]);

  const availableDriverIds = new Set((locations ?? []).map((loc) => loc.driver_id));
  const regionalDriverMap = new Map<string, string[]>();

  (drivers ?? []).forEach((driver) => {
    if (!driver.region_id || !availableDriverIds.has(driver.id)) {
      return;
    }

    const current = regionalDriverMap.get(driver.region_id) ?? [];
    current.push(driver.id);
    regionalDriverMap.set(driver.region_id, current);
  });

  let assignedCount = 0;

  for (const booking of bookings ?? []) {
    const candidates = regionalDriverMap.get(booking.region_id) ?? [];
    const selectedDriverId = candidates.shift();

    if (!selectedDriverId) {
      continue;
    }

    regionalDriverMap.set(booking.region_id, candidates);

    const { error } = await supabase
      .from('bookings')
      .update({ driver_id: selectedDriverId, status: 'assigned' })
      .eq('id', booking.id)
      .eq('status', 'confirmed')
      .is('driver_id', null);

    if (error) {
      continue;
    }

    assignedCount += 1;

    await supabase.from('notifications').insert({
      user_id: selectedDriverId,
      title: 'Trip Baru Ditugaskan',
      body: 'Kamu mendapat trip baru dari auto-dispatch.',
      type: 'trip',
      channel: 'push',
      data: { booking_id: booking.id },
    });
  }

  return NextResponse.json({ success: true, data: { assignedCount } });
}
