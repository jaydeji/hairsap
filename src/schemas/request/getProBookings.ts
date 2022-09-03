import { z } from 'zod'

const STATUS = {
  NEW: 'new',
  COMPLETED: 'completed',
  RETURNED: 'returned',
} as const

const PERIOD = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
} as const

export const GetProBookingsReqSchema = z
  .object({
    proId: z.number(),
    status: z.nativeEnum(STATUS),
    period: z.nativeEnum(PERIOD),
  })
  .strict()

export type GetProBookingsReq = z.infer<typeof GetProBookingsReqSchema>
