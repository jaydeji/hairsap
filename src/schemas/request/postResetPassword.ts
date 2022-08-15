import { z } from 'zod'

export const PostResetPasswordReqSchema = z
  .object({
    email: z.string().email(),
  })
  .strict()

export type PostResetPasswordReq = z.infer<typeof PostResetPasswordReqSchema>
