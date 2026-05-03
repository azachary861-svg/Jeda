'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import { createClient } from '@/lib/supabase/client';

type DriverPoint = {
  driver_id: string;
  full_name: string;
  latitude: number;
  longitude: number;
  status: 'offline' | 'standby' | 'on_trip' | 'break' | string;
  last_seen: string;
};

type DispatchMapProps = {
  initialPoints: DriverPoint[];
};

const defaultView = {
  latitude: -2.5,
  longitude: 118,
  zoom: 3.5,
};

function markerClass(status: DriverPoint['status']) {
  if (status === 'on_trip') {
    return 'bg-emerald-500';
  }

  if (status === 'standby') {
    return 'bg-slate-500';
  }

  if (status === 'offline') {
    return 'bg-slate-300';
  }

  return 'bg-rose-500';
}

export function DispatchMap({ initialPoints }: DispatchMapProps) {
  const [points, setPoints] = useState<DriverPoint[]>(initialPoints);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const channel = supabase
      .channel('dispatch-driver-locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_locations' }, (payload) => {
        const next = payload.new as {
          driver_id?: string;
          latitude?: number;
          longitude?: number;
          status?: string;
          last_seen?: string;
        };

        if (!next.driver_id || typeof next.latitude !== 'number' || typeof next.longitude !== 'number') {
          return;
        }

        const driverId = next.driver_id;
        const latitude = next.latitude;
        const longitude = next.longitude;

        setPoints((current) => {
          const index = current.findIndex((item) => item.driver_id === driverId);

          if (index === -1) {
            return [
              {
                driver_id: driverId,
                full_name: `Driver ${driverId.slice(0, 6)}`,
                latitude,
                longitude,
                status: next.status ?? 'standby',
                last_seen: next.last_seen ?? new Date().toISOString(),
              },
              ...current,
            ];
          }

          const updated = [...current];
          updated[index] = {
            ...updated[index],
            latitude,
            longitude,
            status: next.status ?? updated[index].status,
            last_seen: next.last_seen ?? updated[index].last_seen,
          };

          return updated;
        });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (!token) {
    return (
      <section className="mt-6 rounded-lg border bg-white p-4">
        <h2 className="text-lg font-semibold">Dispatch Map</h2>
        <p className="mt-2 text-sm text-slate-600">NEXT_PUBLIC_MAPBOX_TOKEN belum diatur. Peta belum bisa ditampilkan.</p>
      </section>
    );
  }

  return (
    <section className="mt-6 rounded-lg border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Dispatch Map (Live)</h2>
        <p className="text-xs text-slate-500">Hijau: on trip • Abu: standby • Merah: perlu perhatian</p>
      </div>

      <div className="h-[420px] overflow-hidden rounded-lg border">
        <Map
          mapboxAccessToken={token}
          initialViewState={defaultView}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          <NavigationControl position="top-right" />

          {points.map((point) => (
            <Marker key={point.driver_id} longitude={point.longitude} latitude={point.latitude} anchor="bottom">
              <div className="group relative">
                <div className={`h-3.5 w-3.5 rounded-full border-2 border-white shadow ${markerClass(point.status)}`} />
                <div className="pointer-events-none absolute -left-16 -top-16 hidden w-40 rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                  <p className="font-medium">{point.full_name}</p>
                  <p>Status: {point.status}</p>
                  <p>{new Date(point.last_seen).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </Marker>
          ))}
        </Map>
      </div>
    </section>
  );
}
