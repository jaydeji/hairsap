import { z } from 'zod'

export const PatchAddServiceSchema = z
  .object({
    subServiceId: z.number(),
    bookingId: z.number(),
    userId: z.number(),
  })
  .strict()

export type PatchAddService = z.infer<typeof PatchAddServiceSchema>
