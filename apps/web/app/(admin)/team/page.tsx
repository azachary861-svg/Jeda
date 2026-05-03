import { createClient } from '@/lib/supabase/server';

export default async function TeamPage() {
  const supabase = await createClient();

  const [{ data: members }, { data: verifications }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id,full_name,role,region_id,is_active')
      .in('role', ['driver', 'photographer', 'guide'])
      .limit(300),
    supabase.from('driver_verifications').select('driver_id,overall_status').limit(300),
  ]);

  const verifMap = new Map((verifications ?? []).map((row) => [row.driver_id, row.overall_status]));

  return (
    <main>
      <h1 className="text-2xl font-semibold">Team Management</h1>
      <section className="mt-4 rounded-lg border bg-white p-4">
        <div className="space-y-2 text-sm">
          {(members ?? []).map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded border p-2">
              <div>
                <p className="font-medium">{member.full_name}</p>
                <p className="text-xs text-slate-500">{member.role} • {member.region_id ?? '-'}</p>
              </div>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                {verifMap.get(member.id) ?? 'pending'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
