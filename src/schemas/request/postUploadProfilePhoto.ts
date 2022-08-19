import { z } from 'zod'

export const PostUploadProfilePhotoReqSchema = z
  .object({
    userId: z.number(),
    profilePhotoKey: z.string(),
    profilePhotoOriginalFileName: z.string(),
    profilePhotoUrl: z.string(),
  })
  .strict()
export type PostUploadProfilePhotoReq = z.infer<
  typeof PostUploadProfilePhotoReqSchema
>
