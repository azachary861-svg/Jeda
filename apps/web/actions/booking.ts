'use server';

import { bookingCreateSchema } from '@/lib/validations/booking';
import { createClient } from '@/lib/supabase/server';

type ActionResult = {
  success: boolean;
  error?: string;
  data?: { bookingId: string };
};

export async function createBookingAction(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const parsed = bookingCreateSchema.safeParse({
    packageId: formData.get('packageId'),
    tripDate: formData.get('tripDate'),
    pickupTime: formData.get('pickupTime'),
    pickupLocation: formData.get('pickupLocation'),
    paxCount: Number(formData.get('paxCount')),
    addPhotographer: formData.get('addPhotographer') === 'on',
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Payload tidak valid' };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { success: false, error: 'Unauthorized' };
  }

  const { data: priceData, error: priceError } = await supabase.rpc('calculate_booking_price', {
    p_package_id: parsed.data.packageId,
    p_trip_date: parsed.data.tripDate,
    p_pax_count: parsed.data.paxCount,
    p_add_photographer: parsed.data.addPhotographer,
  });

  if (priceError || !priceData?.[0]) {
    return { success: false, error: 'Gagal menghitung harga' };
  }

  const pricing = priceData[0];

  const { data: packageData, error: packageError } = await supabase
    .from('packages')
    .select('region_id')
    .eq('id', parsed.data.packageId)
    .single();

  if (packageError || !packageData) {
    return { success: false, error: 'Paket tidak ditemukan' };
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      client_id: userData.user.id,
      package_id: parsed.data.packageId,
      region_id: packageData.region_id,
      trip_date: parsed.data.tripDate,
      pickup_time: parsed.data.pickupTime,
      pickup_location: parsed.data.pickupLocation,
      pax_count: parsed.data.paxCount,
      add_photographer: parsed.data.addPhotographer,
      base_price: pricing.base_price,
      price_multiplier: pricing.multiplier,
      photographer_fee: pricing.photographer_fee,
      service_fee: pricing.service_fee,
      total_price: Math.round(Number(pricing.base_price) * Number(pricing.multiplier) * parsed.data.paxCount),
      grand_total: pricing.grand_total,
      status: 'pending_payment',
      payment_status: 'pending',
      booking_source: 'web',
    })
    .select('id')
    .single();

  if (error || !data) {
    return { success: false, error: 'Gagal membuat booking' };
  }

  return { success: true, data: { bookingId: data.id } };
}
