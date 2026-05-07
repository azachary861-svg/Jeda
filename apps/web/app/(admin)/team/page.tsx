import { createClient } from '@/lib/supabase/server';
import { setTeamMemberStatusAction } from '@/actions/admin';

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
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Team Management</h1>
      <p className="text-sm text-slate-500">Kelola status aktif tim lapangan dan verifikasi driver.</p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Total anggota</p>
          <p className="text-2xl font-semibold">{(members ?? []).length}</p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Driver approved</p>
          <p className="text-2xl font-semibold">
            {(members ?? []).filter((m) => m.role === 'driver' && verifMap.get(m.id) === 'approved').length}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <p className="text-xs text-slate-500">Nonaktif</p>
          <p className="text-2xl font-semibold">{(members ?? []).filter((m) => !m.is_active).length}</p>
        </div>
      </div>

      <section className="mt-4 rounded-lg border bg-white p-4">
        <div className="space-y-2 text-sm">
          {(members ?? []).map((member) => (
            <form
              key={member.id}
              action={setTeamMemberStatusAction}
              className="flex flex-wrap items-center justify-between gap-3 rounded border p-2"
            >
              <input type="hidden" name="memberId" value={member.id} />
              <div>
                <p className="font-medium">{member.full_name}</p>
                <p className="text-xs text-slate-500">{member.role} • {member.region_id ?? '-'}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  name="isActive"
                  defaultValue={member.is_active ? 'true' : 'false'}
                  className="rounded border px-2 py-1 text-xs"
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>

                {member.role === 'driver' ? (
                  <select
                    name="verificationStatus"
                    defaultValue={verifMap.get(member.id) ?? 'pending'}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    <option value="pending">pending</option>
                    <option value="under_review">under_review</option>
                    <option value="approved">approved</option>
                    <option value="rejected">rejected</option>
                    <option value="expired">expired</option>
                  </select>
                ) : null}

                <button className="rounded bg-slate-900 px-3 py-1.5 text-xs text-white">Simpan</button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </main>
  );
}
