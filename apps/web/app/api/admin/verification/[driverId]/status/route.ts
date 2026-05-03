import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verificationStatusSchema } from '@/lib/validations/verification';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ driverId: string }> }
) {
  const { driverId } = await context.params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (!profile || !['super_admin', 'regional_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = verificationStatusSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('driver_verifications').upsert(
    {
      driver_id: driverId,
      overall_status: parsed.data.overallStatus,
      rejection_reason: parsed.data.rejectionReason ?? null,
      notes: parsed.data.notes ?? null,
      verified_by: userData.user.id,
      verified_at: new Date().toISOString(),
    },
    { onConflict: 'driver_id' }
  );

  if (error) {
    return NextResponse.json({ error: 'Verification update failed', code: 'VERIFICATION_UPDATE_FAILED' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
