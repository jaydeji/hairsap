import { z } from 'zod'
import { PageReqSchema } from './Page'

export const GetUserBookingsReqSchema = z
  .object({
    userId: z.number(),
  })
  .merge(PageReqSchema)
  .strict()

export type GetUserBookingsReq = z.infer<typeof GetUserBookingsReqSchema>
