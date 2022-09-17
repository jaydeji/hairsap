import { z } from 'zod'
import { ROLES } from '../../config/constants'

export const PostResetPasswordReqSchema = z
  .object({
    email: z.string().email(),
    role: z.nativeEnum(ROLES),
  })
  .strict()

export type PostResetPasswordReq = z.infer<typeof PostResetPasswordReqSchema>
