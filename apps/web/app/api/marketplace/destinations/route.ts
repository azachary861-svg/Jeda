import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: regions, error } = await supabase
    .from('regions')
    .select('id,name,display_name,slug,description')
    .eq('is_active', true)
    .order('display_name', { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch destinations', code: 'FETCH_FAILED' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: regions ?? [] });
}
