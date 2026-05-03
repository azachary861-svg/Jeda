import { describe, expect, it } from 'vitest';
import { bookingCreateSchema } from '@/lib/validations/booking';

describe('bookingCreateSchema', () => {
  it('accepts valid payload', () => {
    const result = bookingCreateSchema.safeParse({
      packageId: 'ddeb27fb-d9a0-4624-be4d-4615062daed4',
      tripDate: '2026-06-20',
      pickupTime: '08:00',
      pickupLocation: 'Hotel Malioboro Yogyakarta',
      paxCount: 4,
      addPhotographer: true,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid payload', () => {
    const result = bookingCreateSchema.safeParse({
      packageId: 'invalid',
      tripDate: '2026/06/20',
      pickupTime: '8',
      pickupLocation: 'abc',
      paxCount: 0,
      addPhotographer: false,
    });

    expect(result.success).toBe(false);
  });
});
