import { z } from 'zod'
import { OTP_TYPE } from '../../config/constants'

export const PostGenerateOtpReqSchema = z
  .object({
    otpType: z.nativeEnum(OTP_TYPE),
    userId: z.number(),
  })
  .strict()
export type PostGenerateOtpReq = z.infer<typeof PostGenerateOtpReqSchema>
