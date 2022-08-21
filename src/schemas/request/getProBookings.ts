import { z } from 'zod'

export const GetProBookingsReqSchema = z
  .object({
    proId: z.number(),
    status: z.union([z.literal('new'), z.literal('completed')]),
    period: z.union([z.literal('day'), z.literal('week'), z.literal('month')]),
  })
  .strict()

export type GetProBookingsReq = z.infer<typeof GetProBookingsReqSchema>
