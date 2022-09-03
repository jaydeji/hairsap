import { z } from 'zod'

const LIMIT = {
  COMPLETED: 'completed',
  ALL: 'all',
} as const

const STATUS = {
  NEW: 'new',
  RETURNED: 'returned',
  ALL: 'all',
} as const

const PERIOD = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
} as const

export const GetAdminDashBookStatsSchema = z
  .object({
    limit: z.nativeEnum(LIMIT),
    status: z.nativeEnum(STATUS),
    period: z.nativeEnum(PERIOD),
  })
  .strict()

export type GetAdminDashBookStats = z.infer<typeof GetAdminDashBookStatsSchema>
