import { z } from 'zod'
import { ROLES } from '../../config/constants'

export const PostResetPasswordReqSchema = z
  .object({
    email: z.string().email(),
    role: z.nativeEnum(ROLES),
    adminId: z.number().optional(),
    userId: z.number().optional(),
    proId: z.number().optional(),
    expiredAt: z.date(),
  })
  .strict()

export type PostResetPasswordReq = z.infer<typeof PostResetPasswordReqSchema>
