import { createClient } from '@/lib/supabase/server';

export default async function TaxPage() {
  const supabase = await createClient();

  const { data: incomeTransactions } = await supabase
    .from('transactions')
    .select('amount,transaction_date')
    .eq('type', 'income')
    .order('transaction_date', { ascending: false })
    .limit(2000);

  const gross = (incomeTransactions ?? []).reduce((sum, tx) => sum + tx.amount, 0);
  const estimatedPpn = Math.round(gross * 0.11);

  return (
    <main>
      <h1 className="text-2xl font-semibold">Tax Summary</h1>
      <p className="mt-1 text-sm text-slate-600">Ringkasan estimasi PPN bulanan untuk persiapan Coretax.</p>
      <section className="mt-4 rounded-lg border bg-white p-4">
        <p className="text-sm text-slate-500">Gross Revenue</p>
        <p className="text-2xl font-bold">Rp {gross.toLocaleString('id-ID')}</p>
        <p className="mt-2 text-sm text-slate-500">Estimasi PPN (11%)</p>
        <p className="text-xl font-semibold text-rose-700">Rp {estimatedPpn.toLocaleString('id-ID')}</p>
      </section>
    </main>
  );
}
