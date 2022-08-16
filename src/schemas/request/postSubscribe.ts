import { z } from 'zod'

export const PostSubscribeReqSchema = z
  .object({
    userId: z.number(),
    proId: z.number(),
  })
  .strict()

export type PostSubscribeReq = z.infer<typeof PostSubscribeReqSchema>
