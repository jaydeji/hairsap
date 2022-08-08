import { z } from 'zod'

export const PatchUserRequestSchema = z
  .object({
    userId: z.number(),
    photoUrl: z.string().min(1),
  })
  .strict()

export type PatchUserRequest = z.infer<typeof PatchUserRequestSchema>

export const PatchUserUserRequestSchema = PatchUserRequestSchema.extend({})
export type PatchUserUserRequest = z.infer<typeof PatchUserUserRequestSchema>

export const PatchUserProRequestSchema = PatchUserRequestSchema.extend({
  closingAt: z.date(),
  resumptionAt: z.date(),
})
export type PatchUserProRequest = z.infer<typeof PatchUserProRequestSchema>
