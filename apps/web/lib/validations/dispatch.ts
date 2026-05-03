import { z } from 'zod';

export const assignDriverSchema = z.object({
  bookingId: z.string().uuid(),
  driverId: z.string().uuid(),
});

export type AssignDriverInput = z.infer<typeof assignDriverSchema>;
