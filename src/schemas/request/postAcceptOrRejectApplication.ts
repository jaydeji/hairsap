import { z } from 'zod'

const ACTION = {
  accept: 'accept',
  reject: 'reject',
}

export const PostAcceptOrRejectAppReqSchema = z
  .object({
    userId: z.number(),
    action: z.nativeEnum(ACTION),
  })
  .strict()

export type PostAcceptOrRejectAppReq = z.infer<
  typeof PostAcceptOrRejectAppReqSchema
>
