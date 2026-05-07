'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/require-admin';
import { createAdminClient } from '@/lib/supabase/admin';

const teamSchema = z.object({
  memberId: z.string().uuid(),
  isActive: z.enum(['true', 'false']),
  verificationStatus: z.enum(['pending', 'under_review', 'approved', 'rejected', 'expired']).optional(),
});

export async function setTeamMemberStatusAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const parsed = teamSchema.safeParse({
    memberId: formData.get('memberId'),
    isActive: formData.get('isActive'),
    verificationStatus: formData.get('verificationStatus') || undefined,
  });

  if (!parsed.success) return;

  const supabase = createAdminClient();

  const { data: member } = await supabase
    .from('profiles')
    .select('id, role, region_id')
    .eq('id', parsed.data.memberId)
    .maybeSingle();

  if (!member) return;

  if (auth.profile.role === 'regional_admin' && auth.profile.region_id && member.region_id !== auth.profile.region_id) {
    return;
  }

  await supabase
    .from('profiles')
    .update({ is_active: parsed.data.isActive === 'true' })
    .eq('id', member.id);

  if (member.role === 'driver' && parsed.data.verificationStatus) {
    const status = parsed.data.verificationStatus;
    await supabase.from('driver_verifications').upsert(
      {
        driver_id: member.id,
        overall_status: status,
        verified_by: auth.profile.id,
        verified_at: status === 'pending' ? null : new Date().toISOString(),
      },
      { onConflict: 'driver_id' },
    );
  }

  revalidatePath('/team');
}

const createVehicleSchema = z.object({
  plateNumber: z.string().min(3),
  brand: z.string().min(2),
  model: z.string().min(1),
  year: z.coerce.number().int().min(1990).max(2100).optional(),
  capacity: z.coerce.number().int().min(1).max(30),
  regionId: z.string().uuid(),
  driverId: z.string().uuid().optional(),
  status: z.enum(['active', 'service', 'inactive']),
  nextService: z.string().optional(),
});

export async function createVehicleAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const parsed = createVehicleSchema.safeParse({
    plateNumber: formData.get('plateNumber'),
    brand: formData.get('brand'),
    model: formData.get('model'),
    year: formData.get('year') || undefined,
    capacity: formData.get('capacity'),
    regionId: formData.get('regionId'),
    driverId: formData.get('driverId') || undefined,
    status: formData.get('status'),
    nextService: formData.get('nextService') || undefined,
  });

  if (!parsed.success) return;

  const supabase = createAdminClient();

  const regionId =
    auth.profile.role === 'regional_admin' && auth.profile.region_id
      ? auth.profile.region_id
      : parsed.data.regionId;

  await supabase.from('vehicles').insert({
    plate_number: parsed.data.plateNumber.toUpperCase(),
    brand: parsed.data.brand,
    model: parsed.data.model,
    year: parsed.data.year,
    capacity: parsed.data.capacity,
    region_id: regionId,
    driver_id: parsed.data.driverId ?? null,
    status: parsed.data.status,
    next_service: parsed.data.nextService || null,
  });

  revalidatePath('/fleet');
}

const updateVehicleSchema = z.object({
  vehicleId: z.string().uuid(),
  status: z.enum(['active', 'service', 'inactive']),
  fuelLevel: z.coerce.number().int().min(0).max(100),
  isAvailable: z.enum(['true', 'false']),
  driverId: z.string().optional(),
});

export async function updateVehicleAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const parsed = updateVehicleSchema.safeParse({
    vehicleId: formData.get('vehicleId'),
    status: formData.get('status'),
    fuelLevel: formData.get('fuelLevel'),
    isAvailable: formData.get('isAvailable'),
    driverId: formData.get('driverId') || undefined,
  });

  if (!parsed.success) return;

  const supabase = createAdminClient();

  const { data: vehicle } = await supabase
    .from('vehicles')
    .select('id, region_id')
    .eq('id', parsed.data.vehicleId)
    .maybeSingle();

  if (!vehicle) return;

  if (auth.profile.role === 'regional_admin' && auth.profile.region_id && vehicle.region_id !== auth.profile.region_id) {
    return;
  }

  await supabase
    .from('vehicles')
    .update({
      status: parsed.data.status,
      fuel_level: parsed.data.fuelLevel,
      is_available: parsed.data.isAvailable === 'true',
      driver_id: parsed.data.driverId || null,
    })
    .eq('id', vehicle.id);

  revalidatePath('/fleet');
}

const createPricingRuleSchema = z.object({
  name: z.string().min(2),
  ruleType: z.string().min(2),
  multiplier: z.coerce.number().min(0.5).max(3),
  packageId: z.string().optional(),
  regionId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  priority: z.coerce.number().int().min(0).max(100),
  isActive: z.enum(['true', 'false']),
});

export async function createPricingRuleAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const parsed = createPricingRuleSchema.safeParse({
    name: formData.get('name'),
    ruleType: formData.get('ruleType'),
    multiplier: formData.get('multiplier'),
    packageId: formData.get('packageId') || undefined,
    regionId: formData.get('regionId') || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined,
    priority: formData.get('priority'),
    isActive: formData.get('isActive') || 'true',
  });

  if (!parsed.success) return;

  const supabase = createAdminClient();

  const regionId =
    auth.profile.role === 'regional_admin' && auth.profile.region_id
      ? auth.profile.region_id
      : parsed.data.regionId || null;

  await supabase.from('pricing_rules').insert({
    name: parsed.data.name,
    rule_type: parsed.data.ruleType,
    multiplier: parsed.data.multiplier,
    package_id: parsed.data.packageId || null,
    region_id: regionId,
    start_date: parsed.data.startDate || null,
    end_date: parsed.data.endDate || null,
    priority: parsed.data.priority,
    is_active: parsed.data.isActive === 'true',
  });

  revalidatePath('/pricing');
}

const togglePricingRuleSchema = z.object({
  ruleId: z.string().uuid(),
  isActive: z.enum(['true', 'false']),
});

export async function togglePricingRuleAction(formData: FormData) {
  const auth = await requireAdmin();
  if (!auth.ok) return;

  const parsed = togglePricingRuleSchema.safeParse({
    ruleId: formData.get('ruleId'),
    isActive: formData.get('isActive'),
  });

  if (!parsed.success) return;

  const supabase = createAdminClient();
  const { data: rule } = await supabase
    .from('pricing_rules')
    .select('id, region_id')
    .eq('id', parsed.data.ruleId)
    .maybeSingle();

  if (!rule) return;

  if (auth.profile.role === 'regional_admin' && auth.profile.region_id && rule.region_id !== null && rule.region_id !== auth.profile.region_id) {
    return;
  }

  await supabase
    .from('pricing_rules')
    .update({ is_active: parsed.data.isActive === 'true' })
    .eq('id', parsed.data.ruleId);

  revalidatePath('/pricing');
}
