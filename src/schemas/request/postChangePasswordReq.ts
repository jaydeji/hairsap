import { z } from 'zod'

export const PostChangePasswordReqSchema = z
  .object({
    userId: z.number(),
    oldPassword: z.string().min(6).max(32),
    newPassword: z.string().min(6).max(32),
  })
  .strict()

export type PostChangePasswordReq = z.infer<typeof PostChangePasswordReqSchema>
