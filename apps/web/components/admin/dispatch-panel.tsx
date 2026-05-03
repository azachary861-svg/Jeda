'use client';

import { useMemo, useState } from 'react';

type BookingItem = {
  id: string;
  booking_code: string;
  trip_date: string;
  status: string;
  region_id: string;
  created_at?: string;
};

type DriverItem = {
  id: string;
  full_name: string;
  region_id: string | null;
  role: string;
  status?: string;
  last_seen?: string | null;
};

type DispatchPanelProps = {
  bookings: BookingItem[];
  drivers: DriverItem[];
};

export function DispatchPanel({ bookings, drivers }: DispatchPanelProps) {
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [bookings, selectedBookingId]
  );

  const filteredDrivers = useMemo(() => {
    if (!selectedBooking) return drivers;
    return drivers.filter((driver) => driver.region_id === selectedBooking.region_id);
  }, [drivers, selectedBooking]);

  const urgentBookings = useMemo(
    () => bookings.filter((booking) => (booking.created_at ?? '') < staleThreshold),
    [bookings, staleThreshold]
  );

  const standbyDrivers = useMemo(() => drivers.filter((driver) => driver.status === 'standby'), [drivers]);

  const submit = async () => {
    if (!selectedBookingId || !selectedDriverId) {
      setMessage('Pilih booking dan driver terlebih dahulu.');
      return;
    }

    setLoading(true);
    setMessage(null);

    const response = await fetch('/api/admin/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: selectedBookingId, driverId: selectedDriverId }),
    });

    const body = (await response.json()) as { success?: boolean; error?: string };

    if (!response.ok || !body.success) {
      setMessage(body.error ?? 'Gagal assign driver');
      setLoading(false);
      return;
    }

    setMessage('Driver berhasil di-assign.');
    setLoading(false);
  };

  const runAutoDispatch = async () => {
    setAutoLoading(true);
    setMessage(null);

    const response = await fetch('/api/admin/dispatch/auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const body = (await response.json()) as { success?: boolean; data?: { assignedCount?: number }; error?: string };

    if (!response.ok || !body.success) {
      setMessage(body.error ?? 'Gagal menjalankan auto-dispatch.');
      setAutoLoading(false);
      return;
    }

    setMessage(`Auto-dispatch selesai. ${body.data?.assignedCount ?? 0} booking berhasil di-assign.`);
    setAutoLoading(false);
  };

  return (
    <section className="mt-6 rounded-lg border bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center gap-3 border-b pb-4">
        <button
          type="button"
          onClick={runAutoDispatch}
          disabled={autoLoading}
          className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {autoLoading ? 'Menjalankan auto-dispatch...' : 'Assign Semua Otomatis'}
        </button>
        <p className="text-xs text-slate-500">Mode otomatis akan assign booking confirmed ke driver standby dengan region sama.</p>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border p-3">
          <p className="text-xs uppercase text-slate-500">Urgent Booking Queue</p>
          <div className="mt-2 space-y-2 text-sm">
            {urgentBookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="rounded border p-2">
                <p className="font-medium">{booking.booking_code}</p>
                <p className="text-xs text-slate-500">{booking.trip_date}</p>
              </div>
            ))}
            {urgentBookings.length === 0 ? <p className="text-xs text-slate-500">Tidak ada urgent queue.</p> : null}
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <p className="text-xs uppercase text-slate-500">Driver Standby</p>
          <div className="mt-2 space-y-2 text-sm">
            {standbyDrivers.slice(0, 5).map((driver) => (
              <div key={driver.id} className="rounded border p-2">
                <p className="font-medium">{driver.full_name}</p>
                <p className="text-xs text-slate-500">{driver.role}</p>
              </div>
            ))}
            {standbyDrivers.length === 0 ? <p className="text-xs text-slate-500">Belum ada driver standby.</p> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Booking</label>
          <select
            className="w-full rounded border p-2"
            value={selectedBookingId}
            onChange={(event) => setSelectedBookingId(event.target.value)}
          >
            <option value="">Pilih booking</option>
            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.booking_code} - {booking.trip_date} ({booking.status})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Driver/Team</label>
          <select
            className="w-full rounded border p-2"
            value={selectedDriverId}
            onChange={(event) => setSelectedDriverId(event.target.value)}
          >
            <option value="">Pilih driver</option>
            {filteredDrivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.full_name} ({driver.role}) {driver.status ? `- ${driver.status}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded bg-primary px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Memproses...' : 'Assign'}
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </section>
  );
}
