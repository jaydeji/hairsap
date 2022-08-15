import { z } from 'zod'
import { PageReqSchema } from './Page'

export const GetPayoutRequestsReqSchema = z
  .object({})
  .merge(PageReqSchema)
  .strict()

export type GetPayoutRequestsReq = z.infer<typeof GetPayoutRequestsReqSchema>
