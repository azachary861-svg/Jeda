import { z } from 'zod';

export const bookingStatusSchema = z.object({
  status: z.enum(['pending_payment', 'confirmed', 'assigned', 'on_trip', 'completed', 'cancelled', 'refunded']),
  tripStatus: z
    .enum(['scheduled', 'driver_en_route', 'picked_up', 'at_destination', 'returning', 'completed'])
    .nullable()
    .optional(),
});

export type BookingStatusInput = z.infer<typeof bookingStatusSchema>;
