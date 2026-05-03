'use client';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useMemo, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
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
  activeBookingIds: string[];
  bookingCodeMap: Record<string, string>;
};

const defaultView = {
  latitude: -2.5,
  longitude: 118,
  zoom: 3.5,
};

function markerClass(status: string) {
  if (status === 'on_trip') return 'bg-emerald-500';
  if (status === 'standby') return 'bg-slate-500';
  if (status === 'offline') return 'bg-slate-300';
  return 'bg-amber-500';
}

export function RealTripMapLive({ initialLocations, activeBookingIds, bookingCodeMap }: RealTripMapLiveProps) {
  const [locations, setLocations] = useState<DriverLocation[]>(initialLocations);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const filteredBookingIds = useMemo(() => new Set(activeBookingIds), [activeBookingIds]);

  useEffect(() => {
    if (filteredBookingIds.size === 0) {
      return;
    }

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
          if (payload.eventType === 'DELETE') {
            const prev = payload.old as Partial<DriverLocation>;
            if (!prev.id) return;
            setLocations((current) => current.filter((item) => item.id !== prev.id));
            return;
          }

          const next = payload.new as Partial<DriverLocation> & { is_sharing?: boolean };
          if (!next || next.is_sharing === false || !next.id || !next.booking_id) return;
          if (!filteredBookingIds.has(next.booking_id)) return;

          const nextId = next.id;
          const bookingId = next.booking_id;

          setLocations((current) => {
            const index = current.findIndex((item) => item.id === nextId);
            if (index === -1) {
              return [
                {
                  id: nextId,
                  driver_id: next.driver_id ?? '',
                  booking_id: bookingId,
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
              booking_id: bookingId,
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
  }, [filteredBookingIds]);

  const sortedLocations = useMemo(
    () =>
      [...locations]
        .filter((item) => item.booking_id && filteredBookingIds.has(item.booking_id))
        .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()),
    [filteredBookingIds, locations]
  );

  const center = useMemo(() => {
    if (sortedLocations.length === 0) {
      return defaultView;
    }

    const latitude = sortedLocations.reduce((acc, point) => acc + point.latitude, 0) / sortedLocations.length;
    const longitude = sortedLocations.reduce((acc, point) => acc + point.longitude, 0) / sortedLocations.length;

    return { latitude, longitude, zoom: 9 };
  }, [sortedLocations]);

  return (
    <section className="mt-6 space-y-4 rounded-lg border bg-white p-4">
      <div>
        <p className="text-sm font-medium">Booking yang dipantau</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {activeBookingIds.map((id) => (
            <span key={id} className="rounded-full border bg-slate-50 px-3 py-1 text-xs text-slate-700">
              {bookingCodeMap[id] ?? id.slice(0, 8)}
            </span>
          ))}
        </div>
      </div>

      {token ? (
        <div className="h-[420px] overflow-hidden rounded-lg border">
          <Map
            mapboxAccessToken={token}
            initialViewState={center}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
          >
            <NavigationControl position="top-right" />

            {sortedLocations.map((item) => (
              <Marker key={item.id} longitude={item.longitude} latitude={item.latitude} anchor="bottom">
                <div className="group relative">
                  <div className={`h-3.5 w-3.5 rounded-full border-2 border-white shadow ${markerClass(item.status)}`} />
                  <div className="pointer-events-none absolute -left-16 -top-16 hidden w-44 rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block">
                    <p className="font-medium">Booking: {item.booking_id ? bookingCodeMap[item.booking_id] ?? item.booking_id.slice(0, 8) : '-'}</p>
                    <p>Status driver: {item.status}</p>
                    <p>{new Date(item.last_seen).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </Marker>
            ))}
          </Map>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          NEXT_PUBLIC_MAPBOX_TOKEN belum diatur. Menampilkan daftar lokasi sebagai fallback.
        </div>
      )}

      <div className="grid gap-2 text-sm">
        {sortedLocations.length === 0 ? (
          <p className="text-slate-500">Belum ada lokasi driver yang dibagikan untuk booking aktif Anda.</p>
        ) : (
          sortedLocations.map((item) => (
            <div key={item.id} className="rounded border p-3">
              <p className="font-medium">Booking: {item.booking_id ? bookingCodeMap[item.booking_id] ?? item.booking_id.slice(0, 8) : '-'}</p>
              <p>Driver: {item.driver_id.slice(0, 8)}</p>
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
