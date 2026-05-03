import { createClient } from '@/lib/supabase/server';

export default async function CrmPage() {
  const supabase = await createClient();

  const { data: conversations, error: conversationsError } = await supabase
    .from('ai_conversations')
    .select('id,channel,status,created_at,channel_user_id,booking_id,client_id')
    .order('created_at', { ascending: false })
    .limit(60);

  const activeConversation = conversations?.[0] ?? null;

  const { data: messages } = activeConversation
    ? await supabase
        .from('ai_messages')
        .select('id,role,content,created_at')
        .eq('conversation_id', activeConversation.id)
        .order('created_at', { ascending: true })
        .limit(100)
    : { data: [] };

  const { data: notifications } = conversationsError
    ? await supabase
        .from('notifications')
        .select('id,title,body,type,created_at,is_read')
        .order('created_at', { ascending: false })
        .limit(80)
    : { data: [] };

  return (
    <main>
      <h1 className="text-2xl font-semibold">CRM & Chat Center</h1>
      <p className="mt-1 text-sm text-slate-600">Split view conversation center. Jika tabel AI belum termigrasi, fallback ke inbox notifikasi.</p>

      {conversationsError ? (
        <section className="mt-4 rounded-lg border bg-white p-4">
          <p className="mb-3 text-sm text-amber-700">Tabel AI conversation belum tersedia. Menampilkan fallback notifikasi.</p>
          <div className="space-y-2 text-sm">
            {(notifications ?? []).map((item) => (
              <div key={item.id} className="rounded border p-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.title}</p>
                  <span className="text-xs text-slate-500">{item.type}</span>
                </div>
                <p className="mt-1 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-4 grid gap-4 xl:grid-cols-3">
          <div className="rounded-lg border bg-white p-4 xl:col-span-1">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Conversations</h2>
            <div className="mt-3 space-y-2 text-sm">
              {(conversations ?? []).map((conversation) => (
                <div key={conversation.id} className="rounded border p-2">
                  <p className="font-medium">{conversation.channel}</p>
                  <p className="text-xs text-slate-500">Status: {conversation.status}</p>
                  <p className="text-xs text-slate-500">Booking: {conversation.booking_id ?? '-'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4 xl:col-span-2">
            <h2 className="text-sm font-semibold uppercase text-slate-500">Active Conversation</h2>
            {!activeConversation ? <p className="mt-3 text-sm text-slate-500">Belum ada percakapan.</p> : null}
            <div className="mt-3 space-y-2 text-sm">
              {(messages ?? []).map((message) => (
                <div key={message.id} className="rounded border p-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{message.role}</p>
                    <p className="text-xs text-slate-500">{new Date(message.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <p className="mt-1 text-slate-700">{message.content}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
