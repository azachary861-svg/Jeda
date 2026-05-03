'use client';

import { useState } from 'react';

type Booking = {
  id: string;
  booking_code: string;
  trip_date: string;
  status: 'pending_payment' | 'confirmed' | 'assigned' | 'on_trip' | 'completed' | 'cancelled' | 'refunded';
  trip_status: string | null;
  grand_total: number;
};

type BookingsPanelProps = {
  initialBookings: Booking[];
};

const statusOptions: Booking['status'][] = ['pending_payment', 'confirmed', 'assigned', 'on_trip', 'completed', 'cancelled', 'refunded'];

const allowedTransitions: Record<Booking['status'], Booking['status'][]> = {
  pending_payment: ['confirmed', 'cancelled'],
  confirmed: ['assigned', 'cancelled'],
  assigned: ['on_trip', 'cancelled'],
  on_trip: ['completed'],
  completed: ['refunded'],
  cancelled: [],
  refunded: [],
};

export function BookingsPanel({ initialBookings }: BookingsPanelProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const updateStatus = async (bookingId: string, status: Booking['status']) => {
    const target = bookings.find((booking) => booking.id === bookingId);
    if (!target) {
      return;
    }

    const isSameStatus = target.status === status;
    const isValidTransition = allowedTransitions[target.status]?.includes(status) ?? false;

    if (!isSameStatus && !isValidTransition) {
      setMessage(`Transisi status tidak valid: ${target.status} -> ${status}`);
      return;
    }

    setLoadingId(bookingId);
    setMessage(null);

    const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      setBookings((current) =>
        current.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking))
      );
      setMessage('Status booking berhasil diperbarui.');
    } else {
      const body = (await response.json()) as { error?: string };
      setMessage(body.error ?? 'Gagal memperbarui status booking.');
    }

    setLoadingId(null);
  };

  return (
    <div className="mt-6 rounded-lg border bg-white p-4">
      {message ? <p className="mb-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p> : null}
      <div className="space-y-3">
        {bookings.map((booking) => (
          <div key={booking.id} className="rounded border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{booking.booking_code}</p>
                <p className="text-sm text-slate-500">
                  {booking.trip_date} • Rp {booking.grand_total.toLocaleString('id-ID')}
                </p>
              </div>
              <select
                className="rounded border p-2 text-sm"
                value={booking.status}
                onChange={(event) => updateStatus(booking.id, event.target.value as Booking['status'])}
                disabled={loadingId === booking.id}
              >
                {[booking.status, ...statusOptions.filter((option) => allowedTransitions[booking.status]?.includes(option))].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
