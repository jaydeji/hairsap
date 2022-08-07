import { Role } from '@prisma/client'
import { z } from 'zod'

export const PostSignupRequestSchema = z
  .object({
    email: z.string().email(),
    name: z.string(),
    password: z.string().min(6).max(32),
    type: z
      .nativeEnum(Role)
      .refine((role) => role === Role.PRO || role === Role.USER, {
        message: 'type must be user or admin',
      }),
  })
  .strict()

export const PostSignupUserRequestSchema = PostSignupRequestSchema.extend({
  deviceInfo: z.string(),
})

export type PostSignupUserRequest = z.infer<typeof PostSignupUserRequestSchema>

export const PostSignupProRequestSchema = PostSignupRequestSchema.extend({
  businessName: z.string(),
  deviceInfo: z.string(),
})

export type PostSignupProRequest = z.infer<typeof PostSignupProRequestSchema>
