import { createClient } from '@/lib/supabase/server';

export default async function FinancePage() {
  const supabase = await createClient();

  const [{ data: revenueRows }, { data: recentTransactions }] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'income')
      .order('created_at', { ascending: false })
      .limit(2000),
    supabase
      .from('transactions')
      .select('id,category,amount,description,transaction_date')
      .order('transaction_date', { ascending: false })
      .limit(20),
  ]);

  const totalRevenue = (revenueRows ?? []).reduce((acc, row) => acc + row.amount, 0);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Finance</h1>
      <div className="mt-6 rounded-lg border bg-white p-4">
        <p className="text-sm text-slate-500">Total Revenue Recorded</p>
        <p className="text-2xl font-bold text-primary">Rp {totalRevenue.toLocaleString('id-ID')}</p>
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
