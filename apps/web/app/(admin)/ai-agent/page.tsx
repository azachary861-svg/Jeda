import Link from 'next/link';

export default function AIAgentPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">AI Agent</h1>
      <p className="text-sm text-slate-500">
        Kelola basis pengetahuan dan materi training untuk customer service automation.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/ai-agent/knowledge-base" className="rounded-lg border bg-white p-4 text-sm hover:bg-slate-50">
          <p className="font-medium">Knowledge Base</p>
          <p className="mt-1 text-slate-500">Sinkronisasi konten FAQ, SOP, dan kebijakan.</p>
        </Link>
        <Link href="/ai-agent/training" className="rounded-lg border bg-white p-4 text-sm hover:bg-slate-50">
          <p className="font-medium">Training</p>
          <p className="mt-1 text-slate-500">Pantau dataset training dan quality checks.</p>
        </Link>
      </div>
    </main>
  );
}
