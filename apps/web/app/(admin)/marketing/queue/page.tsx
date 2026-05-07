export default function MarketingQueuePage() {
  return (
    <main className="space-y-3">
      <h1 className="text-2xl font-semibold">Marketing Queue</h1>
      <p className="text-sm text-slate-500">Daftar post terjadwal dari table `social_posts`.</p>
      <div className="rounded-lg border bg-white p-4 text-sm text-slate-600">
        Belum ada post terjadwal. Tambahkan aset pada modul marketing dan buat jadwal publish.
      </div>
    </main>
  );
}
