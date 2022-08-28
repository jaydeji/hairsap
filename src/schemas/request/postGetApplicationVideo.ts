import { z } from 'zod'

export const PostApplicationVideoReqSchema = z
  .object({
    proId: z.number(),
    workVideoUrl: z.string(),
    workVideoKey: z.string(),
    workVideoOriginalFileName: z.string(),
  })
  .strict()

export type PostApplicationVideoReq = z.infer<
  typeof PostApplicationVideoReqSchema
>
