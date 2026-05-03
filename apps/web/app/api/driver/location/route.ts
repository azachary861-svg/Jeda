import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { driverLocationSchema } from '@/lib/validations/location';

export async function POST(request: Request) {
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

  if (!profile || !['driver', 'photographer', 'guide'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 });
  }

  const payload = await request.json();
  const parsed = driverLocationSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid payload', code: 'VALIDATION_ERROR' },
      { status: 400 }
    );
  }

  const { error } = await supabase.from('driver_locations').upsert(
    {
      driver_id: userData.user.id,
      booking_id: parsed.data.bookingId ?? null,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      accuracy: parsed.data.accuracy,
      speed: parsed.data.speed,
      heading: parsed.data.heading,
      status: parsed.data.status,
      is_sharing: parsed.data.isSharing,
      last_seen: new Date().toISOString(),
    },
    { onConflict: 'driver_id' }
  );

  if (error) {
    return NextResponse.json({ error: 'Update location failed', code: 'LOCATION_UPDATE_FAILED' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
