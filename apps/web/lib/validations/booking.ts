import { z } from 'zod';

export const bookingCreateSchema = z.object({
  packageId: z.string().uuid(),
  tripDate: z.string().date(),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/),
  pickupLocation: z.string().min(5).max(250),
  paxCount: z.number().int().min(1).max(50),
  addPhotographer: z.boolean().default(false),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;
