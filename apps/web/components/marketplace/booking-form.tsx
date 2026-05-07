'use client';

import { useEffect, useState } from 'react';
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
  const [tripDate, setTripDate] = useState('');
  const [paxCount, setPaxCount] = useState(minPax);
  const [addPhotographer, setAddPhotographer] = useState(false);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<{
    base_price: number;
    multiplier: number;
    photographer_fee: number;
    service_fee: number;
    grand_total: number;
    applied_rule: string;
  } | null>(null);

  useEffect(() => {
    if (!tripDate || paxCount < minPax) {
      setPricing(null);
      setPricingError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setPricingLoading(true);
      setPricingError(null);

      try {
        const response = await fetch('/api/marketplace/pricing/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId,
            tripDate,
            paxCount,
            addPhotographer,
          }),
          signal: controller.signal,
        });

        const body = (await response.json()) as {
          success?: boolean;
          data?: {
            base_price: number;
            multiplier: number;
            photographer_fee: number;
            service_fee: number;
            grand_total: number;
            applied_rule: string;
          };
          error?: string;
        };

        if (!response.ok || !body.success || !body.data) {
          setPricing(null);
          setPricingError(body.error ?? 'Gagal menghitung harga');
          return;
        }

        setPricing(body.data);
      } catch {
        if (!controller.signal.aborted) {
          setPricingError('Gagal menghitung harga');
        }
      } finally {
        if (!controller.signal.aborted) {
          setPricingLoading(false);
        }
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [tripDate, paxCount, addPhotographer, packageId, minPax]);

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
        <input
          name="tripDate"
          required
          type="date"
          className="w-full rounded border p-2"
          value={tripDate}
          onChange={(event) => setTripDate(event.target.value)}
        />
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
          value={paxCount}
          onChange={(event) => setPaxCount(Number(event.target.value || minPax))}
          className="w-full rounded border p-2"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="addPhotographer"
          checked={addPhotographer}
          onChange={(event) => setAddPhotographer(event.target.checked)}
        />{' '}
        Tambah Fotografer
      </label>
      <div className="rounded-lg border bg-slate-50 p-3 text-sm">
        <p className="font-medium text-slate-800">Estimasi Harga Dinamis</p>
        {pricingLoading ? <p className="mt-1 text-slate-500">Menghitung harga...</p> : null}
        {pricingError ? <p className="mt-1 text-red-600">{pricingError}</p> : null}
        {pricing ? (
          <div className="mt-2 space-y-1 text-slate-700">
            <p>Harga dasar: Rp {pricing.base_price.toLocaleString('id-ID')}</p>
            <p>Multiplier: x{Number(pricing.multiplier).toFixed(2)}</p>
            <p>Service fee: Rp {pricing.service_fee.toLocaleString('id-ID')}</p>
            <p>Photographer: Rp {pricing.photographer_fee.toLocaleString('id-ID')}</p>
            <p className="font-semibold text-slate-900">
              Total: Rp {pricing.grand_total.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-slate-500">Rule: {pricing.applied_rule || 'default'}</p>
          </div>
        ) : null}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button disabled={loading} className="rounded bg-primary px-4 py-2 text-white disabled:opacity-60">
        {loading ? 'Memproses...' : 'Buat Booking'}
      </button>
    </form>
  );
}
