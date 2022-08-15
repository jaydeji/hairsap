import { z } from 'zod'
import { CursorSchema } from '../models/Cursor'

export const GetPendingBookingsReqSchema = z
  .object({
    userId: z.number(),
  })
  .strict()
  .merge(CursorSchema)

export type GetPendingBookingsReq = z.infer<typeof GetPendingBookingsReqSchema>
