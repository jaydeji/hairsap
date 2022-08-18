import { z } from 'zod'
import { ROLES } from '../../config/constants'

export const PostResetPasswordReqSchema = z
  .object({
    email: z.string().email(),
    role: z.nativeEnum(ROLES),
    userId: z.number(),
    expiredAt: z.date(),
  })
  .strict()

export type PostResetPasswordReq = z.infer<typeof PostResetPasswordReqSchema>
