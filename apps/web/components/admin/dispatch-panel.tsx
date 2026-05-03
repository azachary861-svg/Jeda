'use client';

import { useMemo, useState } from 'react';

type BookingItem = {
  id: string;
  booking_code: string;
  trip_date: string;
  status: string;
  region_id: string;
};

type DriverItem = {
  id: string;
  full_name: string;
  region_id: string | null;
  role: string;
};

type DispatchPanelProps = {
  bookings: BookingItem[];
  drivers: DriverItem[];
};

export function DispatchPanel({ bookings, drivers }: DispatchPanelProps) {
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [bookings, selectedBookingId]
  );

  const filteredDrivers = useMemo(() => {
    if (!selectedBooking) return drivers;
    return drivers.filter((driver) => driver.region_id === selectedBooking.region_id);
  }, [drivers, selectedBooking]);

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

  return (
    <section className="mt-6 rounded-lg border bg-white p-4">
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
                {driver.full_name} ({driver.role})
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
