import { z } from 'zod'
import { ROLES } from '../../config/constants'
import { PostLoginProRequestSchema } from './postLogin'

export const PostConfirmResetPasswordReqSchema = z
  .object({
    token: z.string().min(1),
    role: z.nativeEnum(ROLES),
    email: z.string().email(),
    expiredAt: z.date(),
    userId: z.number().optional(),
    proId: z.number().optional(),
    adminId: z.number().optional(),
  })
  .merge(PostLoginProRequestSchema.pick({ password: true }))
  .strict()

export type PostConfirmResetPasswordReq = z.infer<
  typeof PostConfirmResetPasswordReqSchema
>

export const PostConfirmResetPasswordUserReqSchema =
  PostConfirmResetPasswordReqSchema.extend({
    userId: z.number(),
    role: z.literal(ROLES.USER),
  })
    .merge(PostLoginProRequestSchema.pick({ password: true }))
    .strict()

export type PostConfirmResetPasswordUserReq = z.infer<
  typeof PostConfirmResetPasswordUserReqSchema
>

export const PostConfirmResetPasswordProReqSchema =
  PostConfirmResetPasswordReqSchema.extend({
    proId: z.number(),
    role: z.literal(ROLES.PRO),
  })
    .merge(PostLoginProRequestSchema.pick({ password: true }))
    .strict()

export type PostConfirmResetPasswordProReq = z.infer<
  typeof PostConfirmResetPasswordProReqSchema
>

export const PostConfirmResetPasswordAdminReqSchema =
  PostConfirmResetPasswordReqSchema.extend({
    adminId: z.number(),
    role: z.literal(ROLES.ADMIN),
  })
    .merge(PostLoginProRequestSchema.pick({ password: true }))
    .strict()

export type PostConfirmResetPasswordAdminReq = z.infer<
  typeof PostConfirmResetPasswordAdminReqSchema
>
