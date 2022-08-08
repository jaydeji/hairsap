import { OTP_TYPE } from '../../config/constants'
import { z } from 'zod'

export const PostValidateOtpReqSchema = z
  .object({
    userId: z.number().min(1),
    otpType: z.nativeEnum(OTP_TYPE),
    otp: z.string().min(6),
  })
  .strict()

export type PostValidateOtpReq = z.infer<typeof PostValidateOtpReqSchema>
