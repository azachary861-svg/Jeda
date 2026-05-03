import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error, code: auth.code }, { status: auth.status });
  }

  const supabase = await createClient();
  const profile = auth.profile;

  let query = supabase.from('transactions').select('type,amount,region_id');

  if (profile.role === 'regional_admin') {
    query = query.eq('region_id', profile.region_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed fetching summary', code: 'QUERY_FAILED' }, { status: 400 });
  }

  const rows = data ?? [];
  const income = rows.filter((row) => row.type === 'income').reduce((acc, row) => acc + row.amount, 0);
  const expense = rows.filter((row) => row.type === 'expense').reduce((acc, row) => acc + row.amount, 0);

  return NextResponse.json({
    success: true,
    data: {
      income,
      expense,
      net: income - expense,
    },
  });
}
