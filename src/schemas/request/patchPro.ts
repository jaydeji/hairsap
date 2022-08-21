import { z } from 'zod'

export const PatchProRequestSchema = z.object({
  userId: z.number(),
  address: z.string().min(1),
  available: z.boolean(),
  accountNumber: z.string(),
  accountName: z.string(),
  bankName: z.string(),
})

export type PatchProRequest = z.infer<typeof PatchProRequestSchema>
