import { ROLES } from '../../config/constants'
import { z } from 'zod'

export const PostSignupRequestSchema = z
  .object({
    email: z.string().email(),
    name: z.string(),
    password: z.string().min(6).max(32),
    role: z
      .nativeEnum(ROLES)
      .refine((role) => role === ROLES.PRO || role === ROLES.USER, {
        message: 'type must be user or admin',
      }),
  })
  .strict()

export const PostSignupUserRequestSchema = PostSignupRequestSchema.extend({
  deviceInfo: z.string().min(1),
  phone: z.string().min(8),
}).strict()

export type PostSignupUserRequest = z.infer<typeof PostSignupUserRequestSchema>

export const PostSignupProRequestSchema = PostSignupRequestSchema.extend({
  businessName: z.string(),
  deviceInfo: z.string().min(1),
  phone: z.string().min(8),
}).strict()

export type PostSignupProRequest = z.infer<typeof PostSignupProRequestSchema>
