import Link from 'next/link';
import type { Route } from 'next';
import { HomeContent } from '@/components/home-content';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Jeda Wisata</h1>
        <p className="mt-3 text-lg text-slate-600">
          Sekarang aplikasi dibagi menjadi dua portal yang jelas: marketplace untuk client dan dashboard untuk admin internal.
        </p>
      </div>

      <HomeContent />
    </main>
  );
}
