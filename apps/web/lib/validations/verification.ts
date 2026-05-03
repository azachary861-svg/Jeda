import { z } from 'zod';

export const verificationStatusSchema = z.object({
  overallStatus: z.enum(['pending', 'under_review', 'approved', 'rejected', 'expired']),
  rejectionReason: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type VerificationStatusInput = z.infer<typeof verificationStatusSchema>;
