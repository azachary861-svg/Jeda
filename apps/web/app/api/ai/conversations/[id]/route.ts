import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error, code: auth.code }, { status: auth.status });
  }

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: conversation, error: conversationError } = await supabase
    .from('ai_conversations')
    .select('id,channel,customer_name,customer_phone,status,created_at,last_message_at')
    .eq('id', id)
    .maybeSingle();

  if (conversationError || !conversation) {
    return NextResponse.json({ error: 'Conversation not found', code: 'NOT_FOUND' }, { status: 404 });
  }

  const { data: messages, error: messagesError } = await supabase
    .from('ai_messages')
    .select('id,role,content,metadata,created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })
    .limit(200);

  if (messagesError) {
    return NextResponse.json({ error: 'Failed to fetch messages', code: 'FETCH_FAILED' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: {
      conversation,
      messages: messages ?? [],
    },
  });
}
