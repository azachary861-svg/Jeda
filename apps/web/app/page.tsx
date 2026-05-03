import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold text-primary">Jeda Wisata</h1>
      <p className="mt-2 text-slate-600">Platform wisata multi-region.</p>
      <div className="mt-6 flex gap-3">
        <Link className="rounded bg-primary px-4 py-2 text-white" href="/packages">
          Lihat Paket
        </Link>
        <Link className="rounded border px-4 py-2" href="/dashboard">
          Admin Dashboard
        </Link>
      </div>
    </main>
  );
}
