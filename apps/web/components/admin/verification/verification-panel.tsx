'use client';

import { useState } from 'react';

type Driver = {
  id: string;
  full_name: string;
  region_id: string | null;
};

type Verification = {
  driver_id: string;
  overall_status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'expired';
  notes: string | null;
  rejection_reason: string | null;
};

type VerificationPanelProps = {
  drivers: Driver[];
  verifications: Verification[];
};

const statusOptions: Verification['overall_status'][] = [
  'pending',
  'under_review',
  'approved',
  'rejected',
  'expired',
];

export function VerificationPanel({ drivers, verifications }: VerificationPanelProps) {
  const [items, setItems] = useState(verifications);
  const [loadingDriverId, setLoadingDriverId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const findStatus = (driverId: string): Verification['overall_status'] =>
    items.find((item) => item.driver_id === driverId)?.overall_status ?? 'pending';

  const updateStatus = async (driverId: string, status: Verification['overall_status']) => {
    setLoadingDriverId(driverId);

    setMessage(null);

    const response = await fetch(`/api/admin/verification/${driverId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overallStatus: status }),
    });

    if (response.ok) {
      setItems((current) => {
        const exists = current.some((item) => item.driver_id === driverId);
        if (exists) {
          return current.map((item) => (item.driver_id === driverId ? { ...item, overall_status: status } : item));
        }

        return [...current, { driver_id: driverId, overall_status: status, notes: null, rejection_reason: null }];
      });
      setMessage('Status verifikasi berhasil diperbarui.');
    } else {
      const body = (await response.json()) as { error?: string };
      setMessage(body.error ?? 'Gagal memperbarui status verifikasi.');
    }

    setLoadingDriverId(null);
  };

  return (
    <section className="mt-6 rounded-lg border bg-white p-4">
      {message ? <p className="mb-3 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p> : null}
      <div className="space-y-3">
        {drivers.map((driver) => (
          <div key={driver.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-medium">{driver.full_name}</p>
              <p className="text-xs text-slate-500">Driver ID: {driver.id}</p>
            </div>
            <select
              className="rounded border p-2 text-sm"
              defaultValue={findStatus(driver.id)}
              disabled={loadingDriverId === driver.id}
              onChange={(event) => updateStatus(driver.id, event.target.value as Verification['overall_status'])}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}
