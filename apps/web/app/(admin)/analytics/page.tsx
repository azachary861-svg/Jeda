import { createClient } from '@/lib/supabase/server';

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const [{ data: transactions }, { data: bookings }, { data: reviews }] = await Promise.all([
    supabase.from('transactions').select('amount,type,transaction_date').limit(3000),
    supabase.from('bookings').select('id,status,created_at,region_id').limit(3000),
    supabase.from('reviews').select('rating,created_at').limit(3000),
  ]);

  const totalIncome = (transactions ?? []).filter((row) => row.type === 'income').reduce((sum, row) => sum + row.amount, 0);
  const totalExpense = (transactions ?? []).filter((row) => row.type === 'expense').reduce((sum, row) => sum + row.amount, 0);
  const conversionBase = bookings?.length ?? 0;
  const completedTrips = (bookings ?? []).filter((booking) => booking.status === 'completed').length;
  const avgRating = (reviews ?? []).length
    ? Number(((reviews ?? []).reduce((sum, row) => sum + row.rating, 0) / (reviews?.length ?? 1)).toFixed(2))
    : 0;

  return (
    <main>
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Revenue</p>
          <p className="text-xl font-bold">Rp {totalIncome.toLocaleString('id-ID')}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Expense</p>
          <p className="text-xl font-bold">Rp {totalExpense.toLocaleString('id-ID')}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Completed Trips</p>
          <p className="text-xl font-bold">{completedTrips}</p>
          <p className="text-xs text-slate-500">from {conversionBase} bookings</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs uppercase text-slate-500">Avg Rating</p>
          <p className="text-xl font-bold">{avgRating}</p>
        </div>
      </div>
    </main>
  );
}
