'use client';

import { useState } from 'react';

type ReviewFormProps = {
  bookingId: string;
  packageId: string;
  disabled?: boolean;
};

export function ReviewForm({ bookingId, packageId, disabled = false }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [driverRating, setDriverRating] = useState(5);
  const [photoRating, setPhotoRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setMessage(null);

    const response = await fetch('/api/marketplace/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId,
        packageId,
        rating,
        driverRating,
        photoRating,
        comment,
      }),
    });

    const body = (await response.json()) as { success?: boolean; error?: string };

    if (!response.ok || !body.success) {
      setMessage(body.error ?? 'Gagal mengirim review');
      setLoading(false);
      return;
    }

    setMessage('Review berhasil dikirim.');
    setLoading(false);
  };

  return (
    <section className="mt-6 rounded-lg border bg-white p-4">
      <h2 className="font-semibold">Kirim Review</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <label className="text-sm">
          Rating Utama
          <input
            type="number"
            min={1}
            max={5}
            className="mt-1 w-full rounded border p-2"
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
          />
        </label>
        <label className="text-sm">
          Rating Driver
          <input
            type="number"
            min={1}
            max={5}
            className="mt-1 w-full rounded border p-2"
            value={driverRating}
            onChange={(event) => setDriverRating(Number(event.target.value))}
          />
        </label>
        <label className="text-sm">
          Rating Foto
          <input
            type="number"
            min={1}
            max={5}
            className="mt-1 w-full rounded border p-2"
            value={photoRating}
            onChange={(event) => setPhotoRating(Number(event.target.value))}
          />
        </label>
      </div>
      <label className="mt-3 block text-sm">
        Komentar
        <textarea
          className="mt-1 w-full rounded border p-2"
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </label>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={disabled || loading}
          className="rounded bg-primary px-4 py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Mengirim...' : 'Kirim Review'}
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </div>
    </section>
  );
}
