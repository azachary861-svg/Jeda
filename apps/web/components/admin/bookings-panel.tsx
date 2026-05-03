'use client';

import { useState } from 'react';

type Booking = {
  id: string;
  booking_code: string;
  trip_date: string;
  status: string;
  trip_status: string | null;
  grand_total: number;
};

type BookingsPanelProps = {
  initialBookings: Booking[];
};

const statusOptions = ['pending_payment', 'confirmed', 'assigned', 'on_trip', 'completed', 'cancelled', 'refunded'];

export function BookingsPanel({ initialBookings }: BookingsPanelProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateStatus = async (bookingId: string, status: string) => {
    setLoadingId(bookingId);

    const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      setBookings((current) =>
        current.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking))
      );
    }

    setLoadingId(null);
  };

  return (
    <div className="mt-6 rounded-lg border bg-white p-4">
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
                onChange={(event) => updateStatus(booking.id, event.target.value)}
                disabled={loadingId === booking.id}
              >
                {statusOptions.map((option) => (
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
