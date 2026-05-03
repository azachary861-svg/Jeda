import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role,region_id')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (!profile || !['super_admin', 'regional_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

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
