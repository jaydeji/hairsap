import { z } from 'zod'
import { isValidPhone } from '../../utils'

export const PatchProRequestSchema = z.object({
  userId: z.number(),
  address: z.string().min(1).optional(),
  phone: z
    .string()
    .optional()
    .refine((e) => isValidPhone(e)),
  available: z.boolean().optional(),
  bio: z.string().optional(),
  account: z
    .object({
      accountNumber: z.string(),
      accountName: z.string(),
      bankName: z.string(),
    })
    .optional(),
})

export type PatchProRequest = z.infer<typeof PatchProRequestSchema>
