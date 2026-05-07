import Link from 'next/link';

export default function MarketingPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Marketing Automation</h1>
      <p className="text-sm text-slate-500">
        Kelola aset konten, antrian posting, kalender publish, dan performa campaign lintas platform.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/marketing/queue" className="rounded-lg border bg-white p-4 text-sm hover:bg-slate-50">
          <p className="font-medium">Queue</p>
          <p className="mt-1 text-slate-500">Lihat post terjadwal dan status publish.</p>
        </Link>
        <Link href="/marketing/calendar" className="rounded-lg border bg-white p-4 text-sm hover:bg-slate-50">
          <p className="font-medium">Calendar</p>
          <p className="mt-1 text-slate-500">Rencana konten mingguan/bulanan.</p>
        </Link>
        <Link href="/marketing/analytics" className="rounded-lg border bg-white p-4 text-sm hover:bg-slate-50">
          <p className="font-medium">Analytics</p>
          <p className="mt-1 text-slate-500">Ringkasan performa channel marketing.</p>
        </Link>
      </div>
    </main>
  );
}
