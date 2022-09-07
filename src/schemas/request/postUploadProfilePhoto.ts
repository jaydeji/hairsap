import { z } from 'zod'

export const PostUploadUserProfilePhotoReqSchema = z
  .object({
    userId: z.number(),
    profilePhotoKey: z.string(),
    profilePhotoOriginalFileName: z.string(),
    profilePhotoUrl: z.string(),
  })
  .strict()
export type PostUploadUserProfilePhotoReq = z.infer<
  typeof PostUploadUserProfilePhotoReqSchema
>

export const PostUploadProProfilePhotoReqSchema = z
  .object({
    proId: z.number(),
    tempProfilePhotoKey: z.string(),
    tempProfilePhotoOriginalFileName: z.string(),
    tempProfilePhotoUrl: z.string(),
  })
  .strict()
export type PostUploadProProfilePhotoReq = z.infer<
  typeof PostUploadProProfilePhotoReqSchema
>
