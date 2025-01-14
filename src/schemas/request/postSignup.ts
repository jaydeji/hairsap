import { OTP_TYPE, ROLES } from '../../config/constants'
import { z } from 'zod'
import { isValidPhone } from '../../utils'

export const PostSignupRequestSchema = z
  .object({
    email: z.string().email(),
    name: z.string(),
    password: z.string().min(6).max(32),
    phone: z.string().refine((e) => isValidPhone(e)),
    otpType: z.nativeEnum(OTP_TYPE).optional(),
    address: z.string().min(2).optional(),
  })
  .strict()

export const PostSignupUserRequestSchema = PostSignupRequestSchema.extend({
  role: z.literal(ROLES.USER),
}).strict()

export type PostSignupUserRequest = z.infer<typeof PostSignupUserRequestSchema>

export const PostSignupProRequestSchema = PostSignupRequestSchema.extend({
  address: z.string().min(2),
  businessName: z.string(),
  role: z.literal(ROLES.PRO),
  serviceId: z.number(),
}).strict()

export type PostSignupProRequest = z.infer<typeof PostSignupProRequestSchema>
