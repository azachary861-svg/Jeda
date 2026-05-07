'use client';

import { useEffect, useMemo, useState } from 'react';

type CheckoutStatusPanelProps = {
  bookingId: string;
  initialStatus: string;
  initialPaymentStatus: string;
};

type BookingStatusResponse = {
  success?: boolean;
  data?: {
    id: string;
    status: string;
    payment_status: string;
    payment_method?: string | null;
  };
};

const pendingStatuses = new Set(['pending', 'pending_payment', 'pending_verification']);

export function CheckoutStatusPanel({
  bookingId,
  initialStatus,
  initialPaymentStatus,
}: CheckoutStatusPanelProps) {
  const [status, setStatus] = useState(initialStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isPending = useMemo(() => pendingStatuses.has(paymentStatus), [paymentStatus]);

  useEffect(() => {
    if (!isPending) return;

    const interval = setInterval(async () => {
      try {
        setIsRefreshing(true);
        const response = await fetch(`/api/marketplace/booking/${bookingId}`, {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) return;
        const body = (await response.json()) as BookingStatusResponse;
        if (!body.success || !body.data) return;

        setStatus(body.data.status);
        setPaymentStatus(body.data.payment_status);
      } finally {
        setIsRefreshing(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [bookingId, isPending]);

  if (paymentStatus === 'paid') {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
        Pembayaran sudah terverifikasi. Booking telah dikonfirmasi.
      </p>
    );
  }

  if (isPending) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        <p className="font-medium">Menunggu konfirmasi pembayaran</p>
        <p className="mt-1">
          Status pembayaran Anda akan diperbarui otomatis setelah webhook gateway diterima.
          {isRefreshing ? ' Memeriksa status terbaru...' : ''}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white p-3 text-sm text-slate-700">
      Status booking: {status} · pembayaran: {paymentStatus}
    </div>
  );
}
