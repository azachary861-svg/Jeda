import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function FinancePage() {
  const supabase = await createClient();

  const [{ data: revenueRows }, { data: recentTransactions }, { data: regions }] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount,type,region_id,category')
      .eq('type', 'income')
      .order('created_at', { ascending: false })
      .limit(2000),
    supabase
      .from('transactions')
      .select('id,category,amount,description,transaction_date')
      .order('transaction_date', { ascending: false })
      .limit(30),
    supabase.from('regions').select('id,display_name,name').eq('is_active', true),
  ]);

  const rows = revenueRows ?? [];
  const totalRevenue = rows.reduce((acc, row) => acc + row.amount, 0);
  const estimatedOpsCost = Math.round(totalRevenue * 0.35);
  const estimatedPayroll = Math.round(totalRevenue * 0.25);
  const estimatedFleet = Math.round(totalRevenue * 0.12);
  const estimatedMarketing = Math.round(totalRevenue * 0.08);
  const estimatedProfit = totalRevenue - (estimatedOpsCost + estimatedPayroll + estimatedFleet + estimatedMarketing);

  const regionPnL = (regions ?? []).map((region) => {
    const regionRevenue = rows.filter((row) => row.region_id === region.id).reduce((sum, row) => sum + row.amount, 0);
    const opsCost = Math.round(regionRevenue * 0.35);
    const payrollCost = Math.round(regionRevenue * 0.25);
    const fleetCost = Math.round(regionRevenue * 0.12);
    const marketingCost = Math.round(regionRevenue * 0.08);
    const netProfit = regionRevenue - (opsCost + payrollCost + fleetCost + marketingCost);
    const marginPercentage = regionRevenue > 0 ? Number(((netProfit / regionRevenue) * 100).toFixed(2)) : 0;

    return {
      id: region.id,
      name: region.display_name ?? region.name,
      regionRevenue,
      opsCost,
      payrollCost,
      fleetCost,
      marketingCost,
      netProfit,
      marginPercentage,
    };
  });

  return (
    <main>
      <h1 className="text-2xl font-semibold">Finance</h1>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Revenue</p>
          <p className="mt-1 text-xl font-bold text-primary">Rp {totalRevenue.toLocaleString('id-ID')}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Ops Cost</p>
          <p className="mt-1 text-xl font-bold">Rp {estimatedOpsCost.toLocaleString('id-ID')}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Payroll</p>
          <p className="mt-1 text-xl font-bold">Rp {estimatedPayroll.toLocaleString('id-ID')}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Fleet</p>
          <p className="mt-1 text-xl font-bold">Rp {estimatedFleet.toLocaleString('id-ID')}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Estimated Profit</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">Rp {estimatedProfit.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/finance/payroll" className="rounded bg-primary px-3 py-2 text-sm text-white">
          Kelola Payroll
        </Link>
        <Link href="/finance/tax" className="rounded border px-3 py-2 text-sm">
          Laporan Pajak
        </Link>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-4">
        <h2 className="font-semibold">P&L per Region (Snapshot)</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {regionPnL.map((region) => (
            <div key={region.id} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{region.name}</p>
              <p className="mt-1 text-slate-600">Revenue: Rp {region.regionRevenue.toLocaleString('id-ID')}</p>
              <p className="text-slate-600">Net Profit: Rp {region.netProfit.toLocaleString('id-ID')}</p>
              <p className="text-slate-600">Margin: {region.marginPercentage}%</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-white p-4">
        <h2 className="font-semibold">Transaksi Terbaru</h2>
        <div className="mt-3 space-y-2 text-sm">
          {(recentTransactions ?? []).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between rounded border p-2">
              <div>
                <p className="font-medium">{tx.category}</p>
                <p className="text-slate-500">{tx.description}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Rp {tx.amount.toLocaleString('id-ID')}</p>
                <p className="text-slate-500">{tx.transaction_date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
