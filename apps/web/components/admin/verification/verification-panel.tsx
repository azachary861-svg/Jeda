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
  const [loadingDriverId, setLoadingDriverId] = useState<string | null>(null);

  const findStatus = (driverId: string): Verification['overall_status'] =>
    verifications.find((item) => item.driver_id === driverId)?.overall_status ?? 'pending';

  const updateStatus = async (driverId: string, status: Verification['overall_status']) => {
    setLoadingDriverId(driverId);

    await fetch(`/api/admin/verification/${driverId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overallStatus: status }),
    });

    setLoadingDriverId(null);
    window.location.reload();
  };

  return (
    <section className="mt-6 rounded-lg border bg-white p-4">
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
