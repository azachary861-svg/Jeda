'use client';

import { useState } from 'react';

type StripePaymentButtonProps = {
  bookingId: string;
  disabled?: boolean;
};

export function StripePaymentButton({ bookingId, disabled = false }: StripePaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'AUD' | 'EUR'>('USD');
  const [message, setMessage] = useState<string | null>(null);

  const pay = async () => {
    setLoading(true);
    setMessage(null);

    const response = await fetch(`/api/marketplace/booking/${bookingId}/stripe-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currency }),
    });

    const body = (await response.json()) as {
      success?: boolean;
      data?: { checkoutUrl?: string | null };
      error?: string;
    };

    if (!response.ok || !body.success || !body.data?.checkoutUrl) {
      setMessage(body.error ?? 'Gagal membuat Stripe checkout');
      setLoading(false);
      return;
    }

    window.location.href = body.data.checkoutUrl;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <label htmlFor="stripe-currency">Mata Uang:</label>
        <select
          id="stripe-currency"
          className="rounded border p-2"
          value={currency}
          onChange={(event) => setCurrency(event.target.value as 'USD' | 'AUD' | 'EUR')}
          disabled={disabled || loading}
        >
          <option value="USD">USD</option>
          <option value="AUD">AUD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      <button
        type="button"
        onClick={pay}
        disabled={disabled || loading}
        className="rounded border border-primary px-4 py-2 text-primary disabled:opacity-60"
      >
        {loading ? 'Mengarahkan ke Stripe...' : 'Bayar Internasional (Stripe)'}
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
