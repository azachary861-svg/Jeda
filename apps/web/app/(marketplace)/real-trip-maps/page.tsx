import { createClient } from '@/lib/supabase/server';
import { RealTripMapLive } from '@/components/marketplace/real-trip-map-live';

export default async function RealTripMapsPage() {
  const supabase = await createClient();

  const { data: initialLocations } = await supabase
    .from('driver_locations')
    .select('id,driver_id,booking_id,latitude,longitude,status,last_seen')
    .eq('is_sharing', true)
    .order('last_seen', { ascending: false })
    .limit(100);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Real Trip Maps</h1>
      <p className="mt-1 text-sm text-slate-600">Posisi driver yang sedang membagikan lokasi secara publik.</p>
      <RealTripMapLive initialLocations={initialLocations ?? []} />
    </main>
  );
}
