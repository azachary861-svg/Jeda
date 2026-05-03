import { createClient } from '@/lib/supabase/server';
import { VerificationPanel } from '@/components/admin/verification/verification-panel';

export default async function VerificationPage() {
  const supabase = await createClient();

  const [{ data: drivers }, { data: verifications }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id,full_name,region_id')
      .eq('role', 'driver')
      .eq('is_active', true)
      .limit(200),
    supabase
      .from('driver_verifications')
      .select('driver_id,overall_status,notes,rejection_reason')
      .limit(200),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-2xl font-semibold">Driver Verification</h1>
      <p className="mt-1 text-sm text-slate-600">Review dan update status verifikasi driver.</p>
      <VerificationPanel drivers={drivers ?? []} verifications={verifications ?? []} />
    </main>
  );
}
