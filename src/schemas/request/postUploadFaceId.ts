import { z } from 'zod'
import { ROLES } from '../../config/constants'

export const PostUploadFaceIdOtpReqSchema = z
  .object({
    otp: z.string().min(6),
  })
  .strict()
export type PostUploadFaceIdOtpReq = z.infer<
  typeof PostUploadFaceIdOtpReqSchema
>

export const PostUploadFaceIdOtpUserReqSchema =
  PostUploadFaceIdOtpReqSchema.extend({
    userId: z.number(),
    role: z.literal(ROLES.USER),
  }).strict()
export type PostUploadFaceIdOtpUserReq = z.infer<
  typeof PostUploadFaceIdOtpUserReqSchema
>

export const PostUploadFaceIdOtpProReqSchema =
  PostUploadFaceIdOtpReqSchema.extend({
    proId: z.number(),
    role: z.literal(ROLES.PRO),
  }).strict()
export type PostUploadFaceIdOtpProReq = z.infer<
  typeof PostUploadFaceIdOtpProReqSchema
>
