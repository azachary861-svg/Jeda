'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type DriverLocation = {
  id: string;
  driver_id: string;
  booking_id: string | null;
  latitude: number;
  longitude: number;
  status: string;
  last_seen: string;
};

type RealTripMapLiveProps = {
  initialLocations: DriverLocation[];
};

export function RealTripMapLive({ initialLocations }: RealTripMapLiveProps) {
  const [locations, setLocations] = useState<DriverLocation[]>(initialLocations);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('driver-locations-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_locations',
        },
        (payload) => {
          const next = payload.new as Partial<DriverLocation> & { is_sharing?: boolean };
          if (!next || next.is_sharing === false || !next.id) return;
          const nextId = next.id;

          setLocations((current) => {
            const index = current.findIndex((item) => item.id === nextId);
            if (index === -1) {
              return [
                {
                  id: nextId,
                  driver_id: next.driver_id ?? '',
                  booking_id: next.booking_id ?? null,
                  latitude: Number(next.latitude ?? 0),
                  longitude: Number(next.longitude ?? 0),
                  status: next.status ?? 'standby',
                  last_seen: next.last_seen ?? new Date().toISOString(),
                },
                ...current,
              ];
            }

            const updated = [...current];
            updated[index] = {
              ...updated[index],
              latitude: Number(next.latitude ?? updated[index].latitude),
              longitude: Number(next.longitude ?? updated[index].longitude),
              status: next.status ?? updated[index].status,
              last_seen: next.last_seen ?? updated[index].last_seen,
            };
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const sortedLocations = useMemo(
    () => [...locations].sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()),
    [locations]
  );

  return (
    <section className="mt-6 rounded-lg border bg-white p-4">
      <div className="grid gap-2 text-sm">
        {sortedLocations.length === 0 ? (
          <p className="text-slate-500">Belum ada lokasi driver yang dibagikan.</p>
        ) : (
          sortedLocations.map((item) => (
            <div key={item.id} className="rounded border p-3">
              <p className="font-medium">Driver: {item.driver_id}</p>
              <p>
                Koordinat: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
              </p>
              <p>Status: {item.status}</p>
              <p className="text-slate-500">Last seen: {new Date(item.last_seen).toLocaleString('id-ID')}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
