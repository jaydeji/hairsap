import { z } from 'zod'

export const PostValidateOtpReqSchema = z
  .object({
    otp: z.string().min(6),
    userId: z.number(),
  })
  .strict()
export type PostValidateOtpReq = z.infer<typeof PostValidateOtpReqSchema>
