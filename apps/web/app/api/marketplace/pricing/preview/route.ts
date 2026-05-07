import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const schema = z.object({
  packageId: z.string().uuid(),
  tripDate: z.string().date(),
  paxCount: z.number().int().min(1).max(50),
  addPhotographer: z.boolean().default(false),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid payload' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('calculate_booking_price', {
    p_package_id: parsed.data.packageId,
    p_trip_date: parsed.data.tripDate,
    p_pax_count: parsed.data.paxCount,
    p_add_photographer: parsed.data.addPhotographer,
  });

  if (error || !data?.[0]) {
    return NextResponse.json({ error: 'Gagal menghitung harga' }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: data[0] });
}
