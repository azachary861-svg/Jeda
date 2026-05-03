'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBookingAction } from '@/actions/booking';

type BookingFormProps = {
  packageId: string;
  minPax: number;
  maxPax: number | null;
};

export function BookingForm({ packageId, minPax, maxPax }: BookingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3 rounded-lg border p-4"
      action={async (formData) => {
        setLoading(true);
        setError(null);
        const response = await createBookingAction(formData);
        if (!response.success) {
          setError(response.error ?? 'Gagal membuat booking');
          setLoading(false);
          return;
        }

        if (response.data?.bookingId) {
          router.push(`/checkout/${response.data.bookingId}`);
          return;
        }

        setError('Booking berhasil dibuat, namun redirect gagal.');
        setLoading(false);
      }}
    >
      <input type="hidden" name="packageId" value={packageId} />
      <div>
        <label className="block text-sm">Tanggal Trip</label>
        <input name="tripDate" required type="date" className="w-full rounded border p-2" />
      </div>
      <div>
        <label className="block text-sm">Jam Pickup</label>
        <input name="pickupTime" required type="time" className="w-full rounded border p-2" />
      </div>
      <div>
        <label className="block text-sm">Pickup Location</label>
        <input name="pickupLocation" required className="w-full rounded border p-2" />
      </div>
      <div>
        <label className="block text-sm">Jumlah Pax</label>
        <input
          name="paxCount"
          required
          type="number"
          min={minPax}
          max={maxPax ?? undefined}
          defaultValue={minPax}
          className="w-full rounded border p-2"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="addPhotographer" /> Tambah Fotografer
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button disabled={loading} className="rounded bg-primary px-4 py-2 text-white disabled:opacity-60">
        {loading ? 'Memproses...' : 'Buat Booking'}
      </button>
    </form>
  );
}
