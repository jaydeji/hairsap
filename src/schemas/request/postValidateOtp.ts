import { z } from 'zod'
import { ROLES } from '../../config/constants'

export const PostValidateOtpReqSchema = z
  .object({
    otp: z.string().min(6),
  })
  .strict()
export type PostValidateOtpReq = z.infer<typeof PostValidateOtpReqSchema>

export const PostValidateOtpAdminReqSchema = PostValidateOtpReqSchema.extend({
  adminId: z.number(),
  role: z.literal(ROLES.ADMIN),
}).strict()
export type PostValidateOtpAdminReq = z.infer<
  typeof PostValidateOtpAdminReqSchema
>

export const PostValidateOtpUserReqSchema = PostValidateOtpReqSchema.extend({
  userId: z.number(),
  role: z.literal(ROLES.USER),
}).strict()
export type PostValidateOtpUserReq = z.infer<
  typeof PostValidateOtpUserReqSchema
>

export const PostValidateOtpProReqSchema = PostValidateOtpReqSchema.extend({
  proId: z.number(),
  role: z.literal(ROLES.PRO),
}).strict()
export type PostValidateOtpProReq = z.infer<typeof PostValidateOtpProReqSchema>
