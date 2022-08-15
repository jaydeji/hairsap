import { z } from 'zod'
import { PostLoginProRequestSchema } from './postLogin'

export const PostConfirmResetPasswordReqSchema = z
  .object({
    userId: z.number(),
    token: z.string().min(1),
  })
  .merge(PostLoginProRequestSchema.pick({ password: true }))
  .strict()

export type PostConfirmResetPasswordReq = z.infer<
  typeof PostConfirmResetPasswordReqSchema
>
