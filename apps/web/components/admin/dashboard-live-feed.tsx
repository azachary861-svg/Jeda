'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export type FeedType = 'trip_started' | 'trip_completed' | 'booking_new' | 'alert';

export type FeedItem = {
  id: string;
  type: FeedType;
  message: string;
  regionId: string;
  createdAt: string;
};

type DashboardLiveFeedProps = {
  initialFeed: FeedItem[];
};

const FEED_LIMIT = 20;

export function DashboardLiveFeed({ initialFeed }: DashboardLiveFeedProps) {
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);
  const supabase = useMemo(() => createClient(), []);

  const appendFeed = useCallback((item: FeedItem) => {
    setFeed((current) => [item, ...current].slice(0, FEED_LIMIT));
  }, []);

  useEffect(() => {
    const bookingInsertChannel = supabase
      .channel('hq-live-feed-booking-insert')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        const row = payload.new as { id?: string; region_id?: string; status?: string; created_at?: string };
        appendFeed({
          id: row.id ?? crypto.randomUUID(),
          type: 'booking_new',
          message: `Booking baru masuk (${row.status ?? 'pending'})`,
          regionId: row.region_id ?? '-',
          createdAt: row.created_at ?? new Date().toISOString(),
        });
      })
      .subscribe();

    const bookingUpdateChannel = supabase
      .channel('hq-live-feed-booking-update')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, (payload) => {
        const row = payload.new as { id?: string; region_id?: string; status?: string; updated_at?: string };
        if (!row.status) {
          return;
        }

        if (row.status !== 'on_trip' && row.status !== 'completed') {
          return;
        }

        appendFeed({
          id: row.id ?? crypto.randomUUID(),
          type: row.status === 'completed' ? 'trip_completed' : 'trip_started',
          message: row.status === 'completed' ? 'Trip selesai' : 'Trip dimulai',
          regionId: row.region_id ?? '-',
          createdAt: row.updated_at ?? new Date().toISOString(),
        });
      })
      .subscribe();

    const notificationChannel = supabase
      .channel('hq-live-feed-notification')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const row = payload.new as { id?: string; title?: string; created_at?: string };
        appendFeed({
          id: row.id ?? crypto.randomUUID(),
          type: 'alert',
          message: row.title ? `Alert: ${row.title}` : 'Alert baru',
          regionId: '-',
          createdAt: row.created_at ?? new Date().toISOString(),
        });
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(bookingInsertChannel);
      void supabase.removeChannel(bookingUpdateChannel);
      void supabase.removeChannel(notificationChannel);
    };
  }, [appendFeed, supabase]);

  return (
    <section className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-900">Live ops feed</h2>
        <span className="text-[10px] text-emerald-700">Lihat semua</span>
      </div>
      {feed.length === 0 ? <p className="px-4 py-3 text-sm text-slate-500">Belum ada aktivitas real-time.</p> : null}
      <div>
        {feed.map((item) => (
          <div key={`${item.id}-${item.createdAt}`} className="flex items-start gap-2 border-b border-slate-100 px-4 py-2.5 text-sm last:border-b-0">
            <span
              className={`mt-1 h-1.5 w-1.5 rounded-full ${
                item.type === 'alert' ? 'bg-rose-500' : item.type === 'trip_completed' ? 'bg-indigo-500' : item.type === 'trip_started' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-slate-800">{item.message}</p>
              <p className="text-[10px] text-slate-500">{item.regionId}</p>
            </div>
            <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
