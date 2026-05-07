export default function MarketingAnalyticsPage() {
  return (
    <main className="space-y-3">
      <h1 className="text-2xl font-semibold">Marketing Analytics</h1>
      <p className="text-sm text-slate-500">Pantau metrik engagement, reach, dan konversi campaign.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Reach (7 hari)</p>
          <p className="text-2xl font-semibold">0</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Engagement</p>
          <p className="text-2xl font-semibold">0%</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Leads</p>
          <p className="text-2xl font-semibold">0</p>
        </div>
      </div>
    </main>
  );
}
