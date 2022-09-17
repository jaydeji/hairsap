import { z } from 'zod'
import { ROLES } from '../../config/constants'
import { PostLoginRequestSchema } from './postLogin'

export const PostConfirmResetPasswordReqSchema = z
  .object({
    token: z.string().min(1),
    role: z.nativeEnum(ROLES),
    email: z.string().email(),
  })
  .merge(PostLoginRequestSchema.pick({ password: true }))
  .strict()

export type PostConfirmResetPasswordReq = z.infer<
  typeof PostConfirmResetPasswordReqSchema
>
