import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error, code: auth.code }, { status: auth.status });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('ai_conversations')
    .select('id,channel,customer_name,customer_phone,status,created_at,last_message_at')
    .order('last_message_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations', code: 'FETCH_FAILED' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data });
}
