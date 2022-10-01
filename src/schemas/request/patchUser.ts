import { z } from 'zod'
import { isValidPhone } from '../../utils'

export const PatchUserRequestSchema = z
  .object({
    userId: z.number(),
    address: z.string().min(1).optional(),
    phone: z
      .string()
      .optional()
      .refine((e) => isValidPhone(e)),
  })
  .strict()

export type PatchUserRequest = z.infer<typeof PatchUserRequestSchema>

export const PatchUserUserRequestSchema = PatchUserRequestSchema.extend({})
export type PatchUserUserRequest = z.infer<typeof PatchUserUserRequestSchema>
