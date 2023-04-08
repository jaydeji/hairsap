import { z } from 'zod'

export const PatchAddServiceSchema = z
  .object({
    subServiceIds: z.array(z.number()).min(1),
    bookingId: z.number(),
    userId: z.number(),
  })
  .strict()

export type PatchAddService = z.infer<typeof PatchAddServiceSchema>
