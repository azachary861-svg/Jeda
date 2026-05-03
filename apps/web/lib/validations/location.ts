import { z } from 'zod';

export const driverLocationSchema = z.object({
  bookingId: z.string().uuid().nullable().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  isSharing: z.boolean().default(false),
  status: z.enum(['offline', 'standby', 'on_trip', 'break']).default('standby'),
});

export type DriverLocationInput = z.infer<typeof driverLocationSchema>;
