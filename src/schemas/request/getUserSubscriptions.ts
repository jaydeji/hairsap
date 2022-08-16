import { z } from 'zod'

export const GetUserSubscriptionsReqSchema = z
  .object({
    userId: z.number(),
  })
  .strict()

export type GetUserSubscriptionsReq = z.infer<
  typeof GetUserSubscriptionsReqSchema
>
