import { z } from 'zod'
import { CursorSchema } from '../models/Cursor'

export const GetAcceptedBookingsReqSchema = z
  .object({
    userId: z.number(),
  })
  .strict()
  .merge(CursorSchema)

export type GetAcceptedBookingsReq = z.infer<
  typeof GetAcceptedBookingsReqSchema
>
