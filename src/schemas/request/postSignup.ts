import { ROLES } from '../../config/constants'
import { z } from 'zod'

export const PostSignupRequestSchema = z
  .object({
    email: z.string().email(),
    name: z.string(),
    password: z.string().min(6).max(32),
    phone: z.string().min(8),
    deviceInfo: z.string().min(1),
  })
  .strict()

export const PostSignupUserRequestSchema = PostSignupRequestSchema.extend({
  role: z.literal(ROLES.USER),
}).strict()

export type PostSignupUserRequest = z.infer<typeof PostSignupUserRequestSchema>

export const PostSignupProRequestSchema = PostSignupRequestSchema.extend({
  businessName: z.string(),
  role: z.literal(ROLES.PRO),
}).strict()

export type PostSignupProRequest = z.infer<typeof PostSignupProRequestSchema>
