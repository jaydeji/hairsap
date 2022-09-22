import { z } from 'zod'

export const PatchProRequestSchema = z.object({
  userId: z.number(),
  address: z.string().min(1).optional(),
  available: z.boolean().optional(),
  account: z
    .object({
      accountNumber: z.string(),
      accountName: z.string(),
      bankName: z.string(),
    })
    .optional(),
})

export type PatchProRequest = z.infer<typeof PatchProRequestSchema>
