import { z } from 'zod';

export const reviewCreateSchema = z.object({
  bookingId: z.string().uuid(),
  packageId: z.string().uuid(),
  driverId: z.string().uuid().nullable().optional(),
  rating: z.number().int().min(1).max(5),
  driverRating: z.number().int().min(1).max(5).nullable().optional(),
  photoRating: z.number().int().min(1).max(5).nullable().optional(),
  comment: z.string().min(5).max(1000).optional(),
});

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
