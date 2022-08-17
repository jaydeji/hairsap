import { z } from 'zod'
import { ROLES } from '../../config/constants'
import { PostLoginProRequestSchema } from './postLogin'

export const PostConfirmResetPasswordReqSchema = z
  .object({
    token: z.string().min(1),
    role: z.nativeEnum(ROLES),
    adminId: z.number().optional(),
    userId: z.number().optional(),
    proId: z.number().optional(),
    email: z.string().email(),
    expiredAt: z.date(),
  })
  .merge(PostLoginProRequestSchema.pick({ password: true }))
  .strict()

export type PostConfirmResetPasswordReq = z.infer<
  typeof PostConfirmResetPasswordReqSchema
>
