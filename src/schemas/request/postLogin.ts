import { z } from 'zod'
import { OTP_TYPE, ROLES } from '../../config/constants'

export const PostLoginRequestSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(32),
    otpType: z.nativeEnum(OTP_TYPE),
  })
  .strict()

export type PostLoginRequest = z.infer<typeof PostLoginRequestSchema>

export const PostLoginAdminRequestSchema = PostLoginRequestSchema.extend({
  deviceInfo: z.string(),
  role: z.literal(ROLES.ADMIN),
}).strict()
export type PostLoginAdminRequest = z.infer<typeof PostLoginAdminRequestSchema>

export const PostLoginUserRequestSchema = PostLoginRequestSchema.extend({
  deviceInfo: z.string(),
  role: z.literal(ROLES.USER),
}).strict()
export type PostLoginUserRequest = z.infer<typeof PostLoginUserRequestSchema>

export const PostLoginProRequestSchema = PostLoginRequestSchema.extend({
  deviceInfo: z.string(),
  role: z.literal(ROLES.PRO),
}).strict()
export type PostLoginProRequest = z.infer<typeof PostLoginProRequestSchema>
