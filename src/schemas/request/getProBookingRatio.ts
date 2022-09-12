import { z } from 'zod'

const PERIOD = {
  DAY: 'day',
  WEEK: 'week',
} as const

export const GetProBookingRatioReqSchema = z
  .object({
    proId: z.number(),
    period: z.nativeEnum(PERIOD),
  })
  .strict()

export type GetProBookingRatioReq = z.infer<typeof GetProBookingRatioReqSchema>
