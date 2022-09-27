import { z } from 'zod'

export const PatchUserRequestSchema = z
  .object({
    userId: z.number(),
    address: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
  })
  .strict()

export type PatchUserRequest = z.infer<typeof PatchUserRequestSchema>

export const PatchUserUserRequestSchema = PatchUserRequestSchema.extend({})
export type PatchUserUserRequest = z.infer<typeof PatchUserUserRequestSchema>
