'use client';

import { useState } from 'react';

type PaymentButtonProps = {
  bookingId: string;
  disabled?: boolean;
};

type PaymentResponse = {
  success: boolean;
  data?: {
    token: string;
    redirect_url: string;
  };
  error?: string;
};

export function PaymentButton({ bookingId, disabled = false }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/marketplace/booking/${bookingId}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const body = (await response.json()) as PaymentResponse;

    if (!response.ok || !body.success || !body.data?.redirect_url) {
      setError(body.error ?? 'Gagal membuat transaksi pembayaran');
      setLoading(false);
      return;
    }

    window.location.href = body.data.redirect_url;
  };

  return (
    <div className="space-y-2">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={handlePay}
        disabled={disabled || loading}
        className="rounded bg-primary px-4 py-2 text-white disabled:opacity-60"
      >
        {loading ? 'Mengarahkan ke pembayaran...' : 'Bayar Sekarang'}
      </button>
    </div>
  );
}
